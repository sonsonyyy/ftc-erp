<?php

namespace App\Http\Requests\Purchasing;

use App\Enums\InventoryItemStatus;
use App\Enums\PurchaseRequestStatus;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\Supplier;
use App\Models\WorkOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePurchaseRequest extends FormRequest
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
            'request_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('purchase_requests', 'request_no')->withoutTrashed(),
            ],
            'supplier_id' => [
                'nullable',
                'integer',
                Rule::exists('suppliers', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
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
            'request_date' => ['required', 'date'],
            'needed_by' => ['nullable', 'date', 'after_or_equal:request_date'],
            'status' => ['required', Rule::enum(PurchaseRequestStatus::class)],
            'purpose' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('inventory_items', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'items.*.requested_quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.estimated_unit_cost' => ['nullable', 'numeric', 'gte:0'],
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
                if ($this->input('status') === PurchaseRequestStatus::Ordered->value) {
                    $validator->errors()->add('status', 'Purchase requests are marked as ordered when a purchase order is created.');
                }

                $supplier = Supplier::query()->find($this->integer('supplier_id'));

                if ($supplier !== null && ! $supplier->is_active) {
                    $validator->errors()->add('supplier_id', 'The selected supplier is inactive.');
                }

                if (filled($this->input('work_order_id'))) {
                    $workOrder = WorkOrder::query()->find($this->integer('work_order_id'));
                    $project = filled($this->input('project_id'))
                        ? Project::query()->find($this->integer('project_id'))
                        : null;

                    if ($workOrder !== null && $project !== null && $workOrder->project_id !== $project->getKey()) {
                        $validator->errors()->add('work_order_id', 'The selected work order does not belong to the selected project.');
                    }
                }

                foreach ((array) $this->input('items', []) as $index => $item) {
                    $inventoryItem = InventoryItem::query()->find((int) ($item['inventory_item_id'] ?? 0));

                    if ($inventoryItem !== null && $inventoryItem->status !== InventoryItemStatus::Active) {
                        $validator->errors()->add("items.{$index}.inventory_item_id", 'Only active inventory items can be requested.');
                    }
                }
            },
        ];
    }
}
