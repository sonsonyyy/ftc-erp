<?php

namespace App\Http\Requests\Inventory;

use App\Models\InventoryCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventoryCategoryRequest extends FormRequest
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
        /** @var InventoryCategory $inventoryCategory */
        $inventoryCategory = $this->route('inventory_category');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_categories', 'name')
                    ->ignoreModel($inventoryCategory)
                    ->withoutTrashed(),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
