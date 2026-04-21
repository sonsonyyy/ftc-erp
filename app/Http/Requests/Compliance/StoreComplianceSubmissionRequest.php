<?php

namespace App\Http\Requests\Compliance;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreComplianceSubmissionRequest extends FormRequest
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
            'reference_no' => ['nullable', 'string', 'max:100'],
            'submitted_at' => ['required', 'date'],
            'next_due_date' => ['nullable', 'date'],
            'next_expiry_date' => ['nullable', 'date'],
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
                if (
                    filled($this->input('next_due_date'))
                    && filled($this->input('submitted_at'))
                    && (string) $this->input('next_due_date') < (string) $this->input('submitted_at')
                ) {
                    $validator->errors()->add('next_due_date', 'The next due date must be on or after the submission date.');
                }

                if (
                    filled($this->input('next_expiry_date'))
                    && filled($this->input('submitted_at'))
                    && (string) $this->input('next_expiry_date') < (string) $this->input('submitted_at')
                ) {
                    $validator->errors()->add('next_expiry_date', 'The next expiry date must be on or after the submission date.');
                }
            },
        ];
    }
}
