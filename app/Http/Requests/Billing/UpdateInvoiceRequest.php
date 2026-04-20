<?php

namespace App\Http\Requests\Billing;

use App\Enums\InvoiceStatus;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\WorkOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateInvoiceRequest extends FormRequest
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
            'invoice_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('invoices', 'invoice_no')
                    ->ignore($this->invoice?->getKey())
                    ->withoutTrashed(),
            ],
            'quotation_id' => [
                'nullable',
                'integer',
                Rule::exists('quotations', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'project_id' => [
                'nullable',
                'integer',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'work_order_id' => [
                'nullable',
                'integer',
                Rule::exists('work_orders', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:invoice_date'],
            'tax_amount' => ['required', 'numeric', 'gte:0'],
            'status' => ['required', Rule::enum(InvoiceStatus::class)],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'gte:0'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
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
                $status = InvoiceStatus::from($this->string('status')->toString());

                if (! $status->isManualSelection()) {
                    $validator->errors()->add('status', 'Paid, overdue, and partially paid statuses are assigned automatically.');
                }

                $quotation = filled($this->input('quotation_id'))
                    ? Quotation::query()->find($this->integer('quotation_id'))
                    : null;
                $project = filled($this->input('project_id'))
                    ? Project::query()->find($this->integer('project_id'))
                    : null;
                $workOrder = filled($this->input('work_order_id'))
                    ? WorkOrder::query()->find($this->integer('work_order_id'))
                    : null;
                $customerId = $this->integer('customer_id');

                if ($quotation !== null && $quotation->customer_id !== $customerId) {
                    $validator->errors()->add('quotation_id', 'The selected quotation does not belong to the selected customer.');
                }

                if ($project !== null && $project->customer_id !== $customerId) {
                    $validator->errors()->add('project_id', 'The selected project does not belong to the selected customer.');
                }

                if ($workOrder !== null && $workOrder->customer_id !== $customerId) {
                    $validator->errors()->add('work_order_id', 'The selected work order does not belong to the selected customer.');
                }

                if ($workOrder !== null && $project !== null && $workOrder->project_id !== $project->getKey()) {
                    $validator->errors()->add('work_order_id', 'The selected work order does not belong to the selected project.');
                }

                if ($project !== null && $quotation !== null && $project->quotation_id !== null && $project->quotation_id !== $quotation->getKey()) {
                    $validator->errors()->add('quotation_id', 'The selected quotation does not match the linked project.');
                }

                if ($workOrder !== null && $quotation !== null && $workOrder->quotation_id !== null && $workOrder->quotation_id !== $quotation->getKey()) {
                    $validator->errors()->add('quotation_id', 'The selected quotation does not match the linked work order.');
                }
            },
        ];
    }
}
