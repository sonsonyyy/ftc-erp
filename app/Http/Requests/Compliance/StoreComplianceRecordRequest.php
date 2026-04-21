<?php

namespace App\Http\Requests\Compliance;

use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreComplianceRecordRequest extends FormRequest
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
            'record_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('compliance_records', 'record_no')->withoutTrashed(),
            ],
            'compliance_template_id' => [
                'nullable',
                'integer',
                Rule::exists('compliance_templates', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'title' => ['required', 'string', 'max:255'],
            'agency' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'recurrence_unit' => ['required', Rule::enum(ComplianceRecurrenceUnit::class)],
            'reminder_days' => ['nullable', 'array'],
            'reminder_days.*' => ['integer', Rule::in([90, 60, 30, 15, 7])],
            'assigned_user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'status' => ['required', Rule::enum(ComplianceRecordStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
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
                if (! filled($this->input('due_date')) && ! filled($this->input('expiry_date'))) {
                    $validator->errors()->add('due_date', 'Provide at least a due date or an expiry date.');
                }
            },
        ];
    }
}
