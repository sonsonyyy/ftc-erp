<?php

namespace App\Http\Requests\Purchasing;

use App\Enums\InventoryItemStatus;
use App\Enums\PurchaseOrderStatus;
use App\Enums\PurchaseRequestStatus;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\PurchaseRequest;
use App\Models\PurchaseRequestItem;
use App\Models\Supplier;
use App\Models\WorkOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePurchaseOrderRequest extends FormRequest
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
            'po_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('purchase_orders', 'po_no')->withoutTrashed(),
            ],
            'purchase_request_id' => [
                'nullable',
                'integer',
                Rule::exists('purchase_requests', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'supplier_id' => [
                'required',
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
            'order_date' => ['required', 'date'],
            'expected_date' => ['nullable', 'date', 'after_or_equal:order_date'],
            'status' => ['required', Rule::enum(PurchaseOrderStatus::class)],
            'supplier_reference' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_request_item_id' => ['nullable', 'integer'],
            'items.*.inventory_item_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('inventory_items', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'items.*.ordered_quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_cost' => ['required', 'numeric', 'gte:0'],
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
                if (in_array($this->input('status'), [
                    PurchaseOrderStatus::PartiallyReceived->value,
                    PurchaseOrderStatus::FullyReceived->value,
                ], true)) {
                    $validator->errors()->add('status', 'Receipt statuses are set automatically after receiving.');
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

                $purchaseRequest = filled($this->input('purchase_request_id'))
                    ? PurchaseRequest::query()->find($this->integer('purchase_request_id'))
                    : null;

                if ($purchaseRequest !== null && $purchaseRequest->status === PurchaseRequestStatus::Cancelled) {
                    $validator->errors()->add('purchase_request_id', 'The selected purchase request is cancelled.');
                }

                if ($purchaseRequest !== null && filled($this->input('project_id')) && $purchaseRequest->project_id !== null && $purchaseRequest->project_id !== $this->integer('project_id')) {
                    $validator->errors()->add('project_id', 'The selected project does not match the linked purchase request.');
                }

                if ($purchaseRequest !== null && $purchaseRequest->supplier_id !== null && $purchaseRequest->supplier_id !== $this->integer('supplier_id')) {
                    $validator->errors()->add('supplier_id', 'The selected supplier does not match the linked purchase request.');
                }

                if ($purchaseRequest !== null && filled($this->input('work_order_id')) && $purchaseRequest->work_order_id !== null && $purchaseRequest->work_order_id !== $this->integer('work_order_id')) {
                    $validator->errors()->add('work_order_id', 'The selected work order does not match the linked purchase request.');
                }

                foreach ((array) $this->input('items', []) as $index => $item) {
                    $inventoryItem = InventoryItem::query()->find((int) ($item['inventory_item_id'] ?? 0));

                    if ($inventoryItem !== null && $inventoryItem->status !== InventoryItemStatus::Active) {
                        $validator->errors()->add("items.{$index}.inventory_item_id", 'Only active inventory items can be ordered.');
                    }

                    if ($purchaseRequest !== null && filled($item['purchase_request_item_id'] ?? null)) {
                        $purchaseRequestItem = PurchaseRequestItem::query()->find((int) $item['purchase_request_item_id']);

                        if ($purchaseRequestItem === null || $purchaseRequestItem->purchase_request_id !== $purchaseRequest->getKey()) {
                            $validator->errors()->add("items.{$index}.purchase_request_item_id", 'The selected purchase-request line does not belong to the chosen purchase request.');
                        }

                        if ($purchaseRequestItem !== null && $purchaseRequestItem->inventory_item_id !== (int) $item['inventory_item_id']) {
                            $validator->errors()->add("items.{$index}.inventory_item_id", 'The inventory item does not match the selected purchase-request line.');
                        }
                    }
                }
            },
        ];
    }
}
