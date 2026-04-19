<?php

namespace App\Http\Requests\Inventory;

use App\Enums\InventoryItemStatus;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreStockReturnRequest extends FormRequest
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
            'return_no' => ['required', 'string', 'max:50', Rule::unique('stock_returns', 'return_no')],
            'warehouse_id' => [
                'required',
                'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'project_id' => [
                'nullable',
                'integer',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'work_order_id' => [
                'nullable',
                'integer',
                Rule::exists('work_orders', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'returned_date' => ['required', 'date'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('inventory_items', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.remarks' => ['nullable', 'string', 'max:1000'],
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
                if (! filled($this->input('project_id')) && ! filled($this->input('work_order_id'))) {
                    $validator->errors()->add('project_id', 'Select a project or work order for the return.');
                }

                $warehouse = Warehouse::query()->find($this->integer('warehouse_id'));

                if ($warehouse !== null && ! $warehouse->is_active) {
                    $validator->errors()->add('warehouse_id', 'The selected warehouse is inactive.');
                }

                if (filled($this->input('work_order_id'))) {
                    $workOrder = WorkOrder::query()->find($this->integer('work_order_id'));
                    $project = filled($this->input('project_id'))
                        ? Project::query()->find($this->integer('project_id'))
                        : null;

                    if ($workOrder !== null && $project !== null && $workOrder->project_id !== $project->getKey()) {
                        $validator->errors()->add('work_order_id', 'The selected work order does not belong to the selected project.');
                    }

                    if ($workOrder !== null && $project !== null && $workOrder->project_id === null) {
                        $validator->errors()->add('project_id', 'The selected work order is not linked to a project.');
                    }
                }

                foreach ((array) $this->input('items', []) as $index => $item) {
                    $inventoryItem = InventoryItem::query()->find((int) ($item['inventory_item_id'] ?? 0));

                    if ($inventoryItem !== null && $inventoryItem->status !== InventoryItemStatus::Active) {
                        $validator->errors()->add("items.{$index}.inventory_item_id", 'Only active inventory items can be returned.');
                    }
                }
            },
        ];
    }
}
