<?php

namespace App\Http\Requests\Projects;

use App\Enums\ProjectStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProjectStatusRequest extends FormRequest
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
            'status' => ['required', Rule::enum(ProjectStatus::class)],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'actual_end_date' => ['nullable', 'date'],
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
                $project = $this->route('project');
                $status = ProjectStatus::tryFrom((string) $this->input('status'));

                if ($project === null || $status === null) {
                    return;
                }

                if ($project->status === $status) {
                    $validator->errors()->add('status', 'Choose a different status to record a new transition.');
                }

                if (! $project->status->canTransitionTo($status)) {
                    $validator->errors()->add('status', 'That project status transition is not allowed.');
                }
            },
        ];
    }
}
