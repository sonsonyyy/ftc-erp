<?php

namespace App\Http\Requests\Inventory;

use App\Enums\InventoryItemStatus;
use App\Enums\StockMovementType;
use App\Models\InventoryItem;
use App\Models\Warehouse;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreStockMovementRequest extends FormRequest
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
            'warehouse_id' => [
                'required',
                'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'inventory_item_id' => [
                'required',
                'integer',
                Rule::exists('inventory_items', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'movement_type' => ['required', Rule::enum(StockMovementType::class)],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit_cost' => ['nullable', 'numeric', 'gte:0'],
            'movement_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:50'],
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
                $movementType = filled($this->input('movement_type'))
                    ? StockMovementType::tryFrom((string) $this->input('movement_type'))
                    : null;

                if ($movementType !== null && ! $movementType->isManualEntry()) {
                    $validator->errors()->add('movement_type', 'Use issuance and return records for non-manual stock transactions.');
                }

                $warehouse = Warehouse::query()->find($this->integer('warehouse_id'));

                if ($warehouse !== null && ! $warehouse->is_active) {
                    $validator->errors()->add('warehouse_id', 'The selected warehouse is inactive.');
                }

                $inventoryItem = InventoryItem::query()->find($this->integer('inventory_item_id'));

                if ($inventoryItem !== null && $inventoryItem->status !== InventoryItemStatus::Active) {
                    $validator->errors()->add('inventory_item_id', 'Only active inventory items can be moved.');
                }
            },
        ];
    }
}
