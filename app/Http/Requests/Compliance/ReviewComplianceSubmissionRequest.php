<?php

namespace App\Http\Requests\Compliance;

use App\Models\ComplianceRecord;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReviewComplianceSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $complianceRecord = $this->route('compliance_record');

        return $complianceRecord instanceof ComplianceRecord
            && $this->user() !== null
            && $this->user()->can('approveSubmission', $complianceRecord);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'approval_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
