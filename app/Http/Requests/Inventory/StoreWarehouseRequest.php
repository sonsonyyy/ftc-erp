<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWarehouseRequest extends FormRequest
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
            'warehouse_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('warehouses', 'warehouse_code')->withoutTrashed(),
            ],
            'warehouse_name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:4000'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_no' => ['nullable', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
