<?php

namespace Database\Seeders;

use App\Actions\Billing\RecalculateInvoiceTotalsAction;
use App\Actions\Billing\RecordPaymentAction;
use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\PaymentAllocation;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoBillingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(
        RecalculateInvoiceTotalsAction $recalculateInvoiceTotalsAction,
        RecordPaymentAction $recordPaymentAction,
    ): void {
        PaymentAllocation::query()->delete();
        Payment::query()->withTrashed()->forceDelete();
        InvoiceItem::query()->delete();
        Invoice::query()->withTrashed()->forceDelete();

        $billingUser = $this->user('billing@example.com');

        $invoices = [
            [
                'invoice_no' => 'INV-2026-0001',
                'customer_alias' => 'metrobuild',
                'quotation_no' => 'QTN-2026-0001',
                'project_no' => 'PRJ-2026-0001',
                'work_order_no' => 'WO-2026-0001',
                'invoice_date' => '2026-02-20',
                'due_date' => '2026-03-21',
                'tax_amount' => '12000.00',
                'status' => InvoiceStatus::Issued,
                'remarks' => 'Progress billing for tower retrofit ceiling and piping package.',
                'items' => [
                    [
                        'description' => 'Tower A sprinkler retrofit progress billing',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '80000.00',
                        'remarks' => 'Site mobilization, ceiling opening, and piping works.',
                    ],
                    [
                        'description' => 'Supply and installation consumables',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '28000.00',
                        'remarks' => 'Support hardware and installation accessories.',
                    ],
                ],
            ],
            [
                'invoice_no' => 'INV-2026-0002',
                'customer_alias' => 'harbor_view',
                'quotation_no' => null,
                'project_no' => 'PRJ-2026-0002',
                'work_order_no' => 'WO-2026-0005',
                'invoice_date' => '2026-03-25',
                'due_date' => '2026-04-10',
                'tax_amount' => '6000.00',
                'status' => InvoiceStatus::Issued,
                'remarks' => 'Pump room upgrade billing for devices, conduits, and interface installation.',
                'items' => [
                    [
                        'description' => 'Alarm device and interface installation',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '60000.00',
                        'remarks' => 'Supply and installation of interface hardware.',
                    ],
                    [
                        'description' => 'Weekend shutdown support and testing',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '54000.00',
                        'remarks' => 'Testing, commissioning, and shutdown labor support.',
                    ],
                ],
            ],
            [
                'invoice_no' => 'INV-2026-0003',
                'customer_alias' => 'harbor_view',
                'quotation_no' => null,
                'project_no' => null,
                'work_order_no' => null,
                'invoice_date' => '2026-04-18',
                'due_date' => '2026-05-18',
                'tax_amount' => '2500.00',
                'status' => InvoiceStatus::Issued,
                'remarks' => 'Standalone service billing for follow-up diagnostics and control adjustments.',
                'items' => [
                    [
                        'description' => 'Follow-up diagnostics and alarm reprogramming',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '25000.00',
                        'remarks' => 'Loop review and reprogramming support.',
                    ],
                    [
                        'description' => 'Corrective service manpower',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '22500.00',
                        'remarks' => 'Technician deployment and testing.',
                    ],
                ],
            ],
            [
                'invoice_no' => 'INV-2026-0004',
                'customer_alias' => 'san_isidro_medical',
                'quotation_no' => null,
                'project_no' => null,
                'work_order_no' => null,
                'invoice_date' => '2026-01-15',
                'due_date' => '2026-02-14',
                'tax_amount' => '3000.00',
                'status' => InvoiceStatus::Issued,
                'remarks' => 'Hospital rectification package awaiting collection follow-up.',
                'items' => [
                    [
                        'description' => 'Device rectification scope',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '33000.00',
                        'remarks' => 'Fire alarm device replacement and wiring correction.',
                    ],
                    [
                        'description' => 'Testing and final commissioning support',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '24000.00',
                        'remarks' => 'Final acceptance walkthrough and documentation.',
                    ],
                ],
            ],
            [
                'invoice_no' => 'INV-2026-0005',
                'customer_alias' => 'blue_horizon',
                'quotation_no' => null,
                'project_no' => null,
                'work_order_no' => null,
                'invoice_date' => '2026-04-19',
                'due_date' => '2026-05-19',
                'tax_amount' => '1500.00',
                'status' => InvoiceStatus::Issued,
                'remarks' => 'Current-month service billing not yet due.',
                'items' => [
                    [
                        'description' => 'Preventive maintenance service visit',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '20000.00',
                        'remarks' => 'Preventive maintenance service.',
                    ],
                    [
                        'description' => 'Replacement minor materials',
                        'unit' => 'lot',
                        'quantity' => '1.00',
                        'unit_price' => '8500.00',
                        'remarks' => 'Minor field replacement materials.',
                    ],
                ],
            ],
        ];

        $createdInvoices = [];

        foreach ($invoices as $invoiceData) {
            $invoice = Invoice::query()->create([
                'invoice_no' => $invoiceData['invoice_no'],
                'quotation_id' => $invoiceData['quotation_no'] === null
                    ? null
                    : $this->quotationId($invoiceData['quotation_no']),
                'customer_id' => $this->customerId($invoiceData['customer_alias']),
                'project_id' => $invoiceData['project_no'] === null
                    ? null
                    : $this->projectId($invoiceData['project_no']),
                'work_order_id' => $invoiceData['work_order_no'] === null
                    ? null
                    : $this->workOrderId($invoiceData['work_order_no']),
                'issued_by_user_id' => $billingUser->getKey(),
                'invoice_date' => $invoiceData['invoice_date'],
                'due_date' => $invoiceData['due_date'],
                'tax_amount' => $invoiceData['tax_amount'],
                'status' => $invoiceData['status']->value,
                'remarks' => $invoiceData['remarks'],
            ]);

            foreach ($invoiceData['items'] as $item) {
                $quantity = round((float) $item['quantity'], 2);
                $unitPrice = round((float) $item['unit_price'], 2);

                $invoice->items()->create([
                    'description' => $item['description'],
                    'unit' => $item['unit'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => round($quantity * $unitPrice, 2),
                    'remarks' => $item['remarks'],
                ]);
            }

            $createdInvoices[$invoiceData['invoice_no']] = $recalculateInvoiceTotalsAction->handle($invoice);
        }

        $payments = [
            [
                'payment_no' => 'PAY-2026-0001',
                'customer_alias' => 'metrobuild',
                'payment_date' => '2026-03-12',
                'amount' => '120000.00',
                'payment_method' => 'Bank Transfer',
                'reference_no' => 'RCPT-2026-0312',
                'remarks' => 'Full settlement for retrofit progress billing.',
                'allocations' => [
                    [
                        'invoice_no' => 'INV-2026-0001',
                        'allocated_amount' => '120000.00',
                    ],
                ],
            ],
            [
                'payment_no' => 'PAY-2026-0002',
                'customer_alias' => 'harbor_view',
                'payment_date' => '2026-04-18',
                'amount' => '60000.00',
                'payment_method' => 'Check',
                'reference_no' => 'CHK-248811',
                'remarks' => 'Partial collection applied across two open invoices.',
                'allocations' => [
                    [
                        'invoice_no' => 'INV-2026-0002',
                        'allocated_amount' => '40000.00',
                    ],
                    [
                        'invoice_no' => 'INV-2026-0003',
                        'allocated_amount' => '20000.00',
                    ],
                ],
            ],
        ];

        foreach ($payments as $paymentData) {
            $recordPaymentAction->handle([
                'payment_no' => $paymentData['payment_no'],
                'customer_id' => $this->customerId($paymentData['customer_alias']),
                'payment_date' => $paymentData['payment_date'],
                'amount' => $paymentData['amount'],
                'payment_method' => $paymentData['payment_method'],
                'reference_no' => $paymentData['reference_no'],
                'remarks' => $paymentData['remarks'],
                'allocations' => collect($paymentData['allocations'])
                    ->map(fn (array $allocation) => [
                        'invoice_id' => $createdInvoices[$allocation['invoice_no']]->getKey(),
                        'allocated_amount' => $allocation['allocated_amount'],
                    ])
                    ->all(),
            ], $billingUser);
        }
    }

    /**
     * Resolve the customer identifier for the given customer alias.
     */
    private function customerId(string $customerAlias): int
    {
        return DemoCustomersAndSitesSeeder::customerId($customerAlias);
    }

    /**
     * Resolve the quotation identifier for the given quotation number.
     */
    private function quotationId(string $quotationNo): int
    {
        $quotationId = Quotation::query()
            ->where('quotation_no', $quotationNo)
            ->value('id');

        if ($quotationId === null) {
            throw new RuntimeException("Quotation [{$quotationNo}] was not found while seeding billing.");
        }

        return (int) $quotationId;
    }

    /**
     * Resolve the project identifier for the given project number.
     */
    private function projectId(string $projectNo): int
    {
        $projectId = Project::query()
            ->where('project_no', $projectNo)
            ->value('id');

        if ($projectId === null) {
            throw new RuntimeException("Project [{$projectNo}] was not found while seeding billing.");
        }

        return (int) $projectId;
    }

    /**
     * Resolve the work-order identifier for the given work-order number.
     */
    private function workOrderId(string $workOrderNo): int
    {
        $workOrderId = WorkOrder::query()
            ->where('work_order_no', $workOrderNo)
            ->value('id');

        if ($workOrderId === null) {
            throw new RuntimeException("Work order [{$workOrderNo}] was not found while seeding billing.");
        }

        return (int) $workOrderId;
    }

    /**
     * Resolve the demo user by email.
     */
    private function user(string $email): User
    {
        $user = User::query()
            ->where('email', $email)
            ->first();

        if (! $user instanceof User) {
            throw new RuntimeException("User [{$email}] was not found while seeding billing.");
        }

        return $user;
    }
}
