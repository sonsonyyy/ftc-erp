<?php

namespace App\Actions\Billing;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordPaymentAction
{
    /**
     * Create a new action instance.
     */
    public function __construct(private readonly RecalculateInvoiceTotalsAction $recalculateInvoiceTotalsAction) {}

    /**
     * Record a payment and allocate it across the selected invoices.
     *
     * @param  array<string, mixed>  $validated
     */
    public function handle(array $validated, ?User $user): Payment
    {
        /** @var Payment $payment */
        $payment = DB::transaction(function () use ($validated, $user): Payment {
            $allocations = collect($validated['allocations']);
            $invoiceIds = $allocations
                ->pluck('invoice_id')
                ->map(fn (mixed $invoiceId): int => (int) $invoiceId)
                ->all();

            $invoices = Invoice::query()
                ->whereIn('id', $invoiceIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $allocatedTotal = round((float) $allocations->sum(
                fn (array $allocation): float => (float) $allocation['allocated_amount'],
            ), 2);
            $paymentAmount = round((float) $validated['amount'], 2);

            $errors = [];

            if (abs($allocatedTotal - $paymentAmount) > 0.009) {
                $errors['amount'] = 'The payment amount must match the total allocated amount.';
            }

            foreach ($allocations as $index => $allocation) {
                /** @var Invoice|null $invoice */
                $invoice = $invoices->get((int) $allocation['invoice_id']);
                $allocatedAmount = round((float) $allocation['allocated_amount'], 2);

                if ($invoice === null) {
                    $errors["allocations.{$index}.invoice_id"] = 'The selected invoice could not be found.';

                    continue;
                }

                if ($invoice->customer_id !== (int) $validated['customer_id']) {
                    $errors["allocations.{$index}.invoice_id"] = 'The selected invoice does not belong to the selected customer.';
                }

                if (! $invoice->allowsPayments()) {
                    $errors["allocations.{$index}.invoice_id"] = 'Only issued invoices with an open balance can accept payments.';
                }

                if ($allocatedAmount > round((float) $invoice->balance_amount, 2)) {
                    $errors["allocations.{$index}.allocated_amount"] = 'The allocated amount exceeds the remaining invoice balance.';
                }
            }

            if ($errors !== []) {
                throw ValidationException::withMessages($errors);
            }

            /** @var Payment $payment */
            $payment = Payment::query()->create([
                'payment_no' => $validated['payment_no'],
                'customer_id' => $validated['customer_id'],
                'received_by_user_id' => $user?->getKey(),
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference_no' => $validated['reference_no'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            foreach ($allocations as $allocation) {
                $invoice = $invoices->get((int) $allocation['invoice_id']);

                if (! $invoice instanceof Invoice) {
                    continue;
                }

                PaymentAllocation::query()->create([
                    'payment_id' => $payment->getKey(),
                    'invoice_id' => $invoice->getKey(),
                    'allocated_amount' => $allocation['allocated_amount'],
                ]);

                $this->recalculateInvoiceTotalsAction->handle($invoice);
            }

            return $payment;
        });

        return $payment->load([
            'customer:id,customer_code,company_name',
            'receivedBy:id,name',
            'allocations' => fn ($query) => $query
                ->with([
                    'invoice:id,invoice_no,customer_id,project_id,work_order_id,invoice_date,due_date,total_amount,balance_amount,status',
                    'invoice.project:id,project_no,title',
                    'invoice.workOrder:id,work_order_no,summary',
                ])
                ->orderByDesc('id'),
        ]);
    }
}
