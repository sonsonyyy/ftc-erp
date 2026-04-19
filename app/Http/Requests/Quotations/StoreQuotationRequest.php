<?php

namespace App\Http\Requests\Quotations;

use App\Enums\QuotationStatus;
use App\Models\CustomerSite;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreQuotationRequest extends FormRequest
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
            'quotation_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('quotations', 'quotation_no')->withoutTrashed(),
            ],
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'customer_site_id' => [
                'nullable',
                'integer',
                Rule::exists('customer_sites', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'subject' => ['required', 'string', 'max:255'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:quotation_date'],
            'quotation_amount' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::enum(QuotationStatus::class)],
            'prepared_by_user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'assigned_sales_user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'materialized_at' => ['nullable', 'date'],
            'lost_reason' => ['nullable', 'string', 'max:2000'],
            'remarks' => ['nullable', 'string', 'max:2000'],
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
                $status = QuotationStatus::tryFrom((string) $this->input('status'));

                if ($status?->requiresLostReason() && blank($this->string('lost_reason')->toString())) {
                    $validator->errors()->add('lost_reason', 'A lost reason is required when the quotation is marked as lost.');
                }

                if (blank($this->input('customer_site_id'))) {
                    return;
                }

                $siteBelongsToCustomer = CustomerSite::query()
                    ->whereKey($this->integer('customer_site_id'))
                    ->where('customer_id', $this->integer('customer_id'))
                    ->exists();

                if (! $siteBelongsToCustomer) {
                    $validator->errors()->add('customer_site_id', 'The selected site must belong to the selected customer.');
                }
            },
        ];
    }
}
