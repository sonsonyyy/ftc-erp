<?php

namespace App\Http\Requests\WorkOrders;

use App\Enums\WorkOrderStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateWorkOrderStatusRequest extends FormRequest
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
            'status' => ['required', Rule::enum(WorkOrderStatus::class)],
            'details' => ['nullable', 'string', 'max:2000'],
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
                $workOrder = $this->route('work_order');
                $status = WorkOrderStatus::tryFrom((string) $this->input('status'));

                if ($workOrder === null || $status === null) {
                    return;
                }

                if ($workOrder->status === $status) {
                    $validator->errors()->add('status', 'Choose a different status to record a new transition.');
                }

                if (! $workOrder->status->canTransitionTo($status)) {
                    $validator->errors()->add('status', 'That work order status transition is not allowed.');
                }
            },
        ];
    }
}
