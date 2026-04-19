<?php

namespace App\Http\Requests\Inventory;

use App\Enums\InventoryItemStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryItemRequest extends FormRequest
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
            'sku' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('inventory_items', 'sku')->withoutTrashed(),
            ],
            'item_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('inventory_items', 'item_code')->withoutTrashed(),
            ],
            'item_name' => ['required', 'string', 'max:255'],
            'inventory_category_id' => [
                'nullable',
                'integer',
                Rule::exists('inventory_categories', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'unit' => ['required', 'string', 'max:50'],
            'reorder_level' => ['required', 'numeric', 'gte:0'],
            'standard_cost' => ['nullable', 'numeric', 'gte:0'],
            'status' => ['required', Rule::enum(InventoryItemStatus::class)],
            'notes' => ['nullable', 'string', 'max:4000'],
        ];
    }
}
