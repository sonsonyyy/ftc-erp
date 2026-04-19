<?php

namespace App\Http\Requests\Quotations;

use App\Enums\QuotationStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateQuotationStatusRequest extends FormRequest
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
            'status' => ['required', Rule::enum(QuotationStatus::class)],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'lost_reason' => ['nullable', 'string', 'max:2000'],
            'materialized_at' => ['nullable', 'date'],
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
                $quotation = $this->route('quotation');

                if ($status === null || $quotation === null) {
                    return;
                }

                if ($quotation->status === $status) {
                    $validator->errors()->add('status', 'Choose a different status to record a new status transition.');
                }

                if (
                    ($quotation->converted_project_id !== null || $quotation->converted_work_order_id !== null)
                    && $status !== QuotationStatus::Awarded
                ) {
                    $validator->errors()->add(
                        'status',
                        'Converted quotations must remain awarded while linked to projects or work orders.',
                    );
                }

                if ($status->requiresLostReason() && blank($this->string('lost_reason')->toString())) {
                    $validator->errors()->add('lost_reason', 'A lost reason is required when the quotation is marked as lost.');
                }
            },
        ];
    }
}
