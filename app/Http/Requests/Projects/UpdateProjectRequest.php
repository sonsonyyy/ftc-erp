<?php

namespace App\Http\Requests\Projects;

use App\Enums\QuotationStatus;
use App\Models\CustomerSite;
use App\Models\Quotation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProjectRequest extends FormRequest
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
        $project = $this->route('project');

        return [
            'project_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('projects', 'project_no')
                    ->ignore($project)
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
            'customer_site_id' => [
                'required',
                'integer',
                Rule::exists('customer_sites', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'title' => ['required', 'string', 'max:255'],
            'project_type' => ['required', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'target_end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string', 'max:4000'],
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

                if (! filled($this->input('quotation_id'))) {
                    return;
                }

                $quotation = Quotation::query()->find($this->integer('quotation_id'));

                if ($quotation === null) {
                    return;
                }

                if ($quotation->status !== QuotationStatus::Awarded) {
                    $validator->errors()->add('quotation_id', 'Only awarded quotations may be linked to projects.');
                }

                if ($quotation->customer_id !== $this->integer('customer_id')) {
                    $validator->errors()->add('customer_id', 'The selected quotation belongs to a different customer.');
                }

                if ($quotation->customer_site_id !== null && $quotation->customer_site_id !== $this->integer('customer_site_id')) {
                    $validator->errors()->add('customer_site_id', 'The selected quotation belongs to a different site.');
                }
            },
        ];
    }
}
