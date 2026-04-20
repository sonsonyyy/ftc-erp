<?php

namespace App\Http\Requests\Payroll;

use App\Enums\PayrollRunStatus;
use App\Models\Employee;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePayrollRunRequest extends FormRequest
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
            'payroll_run_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('payroll_runs', 'payroll_run_no')->withoutTrashed(),
            ],
            'period_from' => ['required', 'date'],
            'period_to' => ['required', 'date', 'after_or_equal:period_from'],
            'payroll_date' => ['required', 'date', 'after_or_equal:period_to'],
            'status' => ['required', Rule::enum(PayrollRunStatus::class)],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.employee_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'entries.*.gross_pay' => ['required', 'numeric', 'gt:0'],
            'entries.*.tax_amount' => ['required', 'numeric', 'gte:0'],
            'entries.*.sss_amount' => ['required', 'numeric', 'gte:0'],
            'entries.*.pagibig_amount' => ['required', 'numeric', 'gte:0'],
            'entries.*.philhealth_amount' => ['required', 'numeric', 'gte:0'],
            'entries.*.remarks' => ['nullable', 'string', 'max:1000'],
            'entries.*.deductions' => ['nullable', 'array'],
            'entries.*.deductions.*.deduction_name' => ['required', 'string', 'max:255'],
            'entries.*.deductions.*.amount' => ['required', 'numeric', 'gt:0'],
            'entries.*.deductions.*.remarks' => ['nullable', 'string', 'max:1000'],
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
                foreach ((array) $this->input('entries', []) as $index => $entry) {
                    $employee = Employee::query()->find((int) ($entry['employee_id'] ?? 0));

                    if ($employee !== null && ! $employee->is_active) {
                        $validator->errors()->add("entries.{$index}.employee_id", 'Inactive employees cannot be added to new payroll runs.');
                    }

                    $additionalDeductions = round((float) collect((array) ($entry['deductions'] ?? []))->sum(
                        fn (array $deduction): float => (float) $deduction['amount'],
                    ), 2);

                    $totalDeductions = round(
                        (float) ($entry['tax_amount'] ?? 0)
                        + (float) ($entry['sss_amount'] ?? 0)
                        + (float) ($entry['pagibig_amount'] ?? 0)
                        + (float) ($entry['philhealth_amount'] ?? 0)
                        + $additionalDeductions,
                        2,
                    );

                    if ($totalDeductions > round((float) ($entry['gross_pay'] ?? 0), 2)) {
                        $validator->errors()->add("entries.{$index}.gross_pay", 'Total deductions cannot exceed gross pay.');
                    }
                }
            },
        ];
    }
}
