<?php

namespace App\Http\Requests\Compliance;

use App\Enums\ComplianceTaskStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateComplianceTaskRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'assigned_user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'status' => ['required', Rule::enum(ComplianceTaskStatus::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
