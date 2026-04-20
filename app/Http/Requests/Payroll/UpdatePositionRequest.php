<?php

namespace App\Http\Requests\Payroll;

use App\Models\Position;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePositionRequest extends FormRequest
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
        /** @var Position $position */
        $position = $this->route('position');

        return [
            'department_id' => [
                'nullable',
                'integer',
                Rule::exists('departments', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'title')
                    ->ignore($position)
                    ->where(function ($query) {
                        return filled($this->input('department_id'))
                            ? $query->where('department_id', $this->integer('department_id'))
                            : $query->whereNull('department_id');
                    })
                    ->withoutTrashed(),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
