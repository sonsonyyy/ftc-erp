<?php

namespace App\Http\Requests\Billing;

use App\Models\Invoice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('payments', 'payment_no')->withoutTrashed(),
            ],
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_method' => ['required', 'string', 'max:100'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'allocations' => ['required', 'array', 'min:1'],
            'allocations.*.invoice_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('invoices', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'allocations.*.allocated_amount' => ['required', 'numeric', 'gt:0'],
        ];
    }

    /**
     * Get the validators that should run after validation.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $amount = round((float) $this->input('amount'), 2);
                $allocatedTotal = round((float) collect((array) $this->input('allocations', []))->sum(
                    fn (array $allocation): float => (float) $allocation['allocated_amount'],
                ), 2);

                if (abs($allocatedTotal - $amount) > 0.009) {
                    $validator->errors()->add('amount', 'The payment amount must equal the total allocated amount.');
                }

                foreach ((array) $this->input('allocations', []) as $index => $allocation) {
                    $invoice = Invoice::query()->find((int) ($allocation['invoice_id'] ?? 0));

                    if ($invoice === null) {
                        continue;
                    }

                    if ($invoice->customer_id !== $this->integer('customer_id')) {
                        $validator->errors()->add("allocations.{$index}.invoice_id", 'The selected invoice does not belong to the selected customer.');
                    }

                    if (! $invoice->allowsPayments()) {
                        $validator->errors()->add("allocations.{$index}.invoice_id", 'Only issued invoices with an open balance can accept payments.');
                    }

                    if ((float) ($allocation['allocated_amount'] ?? 0) > round((float) $invoice->balance_amount, 2)) {
                        $validator->errors()->add("allocations.{$index}.allocated_amount", 'The allocated amount exceeds the remaining invoice balance.');
                    }
                }
            },
        ];
    }
}
