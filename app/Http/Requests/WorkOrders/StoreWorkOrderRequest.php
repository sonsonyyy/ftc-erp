<?php

namespace App\Http\Requests\WorkOrders;

use App\Enums\QuotationStatus;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\Quotation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreWorkOrderRequest extends FormRequest
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
            'work_order_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('work_orders', 'work_order_no')->withoutTrashed(),
            ],
            'quotation_id' => [
                'nullable',
                'integer',
                Rule::exists('quotations', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'project_id' => [
                'nullable',
                'integer',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'customer_site_id' => [
                'required',
                'integer',
                Rule::exists('customer_sites', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'service_type' => ['required', Rule::enum(WorkOrderServiceType::class)],
            'scheduled_date' => ['nullable', 'date'],
            'priority' => ['required', Rule::enum(WorkOrderPriority::class)],
            'status' => ['required', Rule::enum(WorkOrderStatus::class)],
            'summary' => ['required', 'string', 'max:255'],
            'findings' => ['nullable', 'string', 'max:4000'],
            'completion_date' => ['nullable', 'date'],
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
                $siteBelongsToCustomer = CustomerSite::query()
                    ->whereKey($this->integer('customer_site_id'))
                    ->where('customer_id', $this->integer('customer_id'))
                    ->exists();

                if (! $siteBelongsToCustomer) {
                    $validator->errors()->add('customer_site_id', 'The selected site must belong to the selected customer.');
                }

                if (filled($this->input('quotation_id'))) {
                    $quotation = Quotation::query()->find($this->integer('quotation_id'));

                    if ($quotation !== null) {
                        if ($quotation->status !== QuotationStatus::Awarded) {
                            $validator->errors()->add('quotation_id', 'Only awarded quotations may be linked to work orders.');
                        }

                        if ($quotation->converted_work_order_id !== null) {
                            $validator->errors()->add('quotation_id', 'The selected quotation is already linked to a work order.');
                        }

                        if ($quotation->customer_id !== $this->integer('customer_id')) {
                            $validator->errors()->add('customer_id', 'The selected quotation belongs to a different customer.');
                        }

                        if (
                            $quotation->customer_site_id !== null
                            && $quotation->customer_site_id !== $this->integer('customer_site_id')
                        ) {
                            $validator->errors()->add('customer_site_id', 'The selected quotation belongs to a different site.');
                        }
                    }
                }

                if (! filled($this->input('project_id'))) {
                    return;
                }

                $project = Project::query()->find($this->integer('project_id'));

                if ($project === null) {
                    return;
                }

                if ($project->customer_id !== $this->integer('customer_id')) {
                    $validator->errors()->add('customer_id', 'The selected project belongs to a different customer.');
                }

                if ($project->customer_site_id !== $this->integer('customer_site_id')) {
                    $validator->errors()->add('customer_site_id', 'The selected project belongs to a different site.');
                }

                if (
                    $project->quotation_id !== null
                    && filled($this->input('quotation_id'))
                    && $project->quotation_id !== $this->integer('quotation_id')
                ) {
                    $validator->errors()->add('quotation_id', 'The selected project is linked to a different quotation.');
                }
            },
        ];
    }
}
