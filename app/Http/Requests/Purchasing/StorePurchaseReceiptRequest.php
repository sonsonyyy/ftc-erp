<?php

namespace App\Http\Requests\Purchasing;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Warehouse;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePurchaseReceiptRequest extends FormRequest
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
            'receipt_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('purchase_receipts', 'receipt_no'),
            ],
            'warehouse_id' => [
                'required',
                'integer',
                Rule::exists('warehouses', 'id')->where(fn ($query) => $query->whereNull('deleted_at')),
            ],
            'received_date' => ['required', 'date'],
            'supplier_reference' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'integer', 'distinct'],
            'items.*.received_quantity' => ['required', 'numeric', 'gt:0'],
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
                /** @var PurchaseOrder|null $purchaseOrder */
                $purchaseOrder = $this->route('purchase_order');
                $warehouse = Warehouse::query()->find($this->integer('warehouse_id'));

                if ($purchaseOrder === null) {
                    $validator->errors()->add('purchase_order', 'The selected purchase order could not be resolved.');

                    return;
                }

                if (! $purchaseOrder->status->allowsReceiving()) {
                    $validator->errors()->add('status', 'Only approved or partially received purchase orders can accept receipts.');
                }

                if ($warehouse !== null && ! $warehouse->is_active) {
                    $validator->errors()->add('warehouse_id', 'The selected warehouse is inactive.');
                }

                $purchaseOrder->load([
                    'items' => fn ($query) => $query->withSum('receiptItems as received_quantity_total', 'received_quantity'),
                ]);

                /** @var array<int, PurchaseOrderItem> $purchaseOrderItems */
                $purchaseOrderItems = $purchaseOrder->items->keyBy('id')->all();

                foreach ((array) $this->input('items', []) as $index => $item) {
                    $purchaseOrderItem = $purchaseOrderItems[(int) ($item['purchase_order_item_id'] ?? 0)] ?? null;

                    if ($purchaseOrderItem === null) {
                        $validator->errors()->add("items.{$index}.purchase_order_item_id", 'The selected purchase-order line does not belong to this purchase order.');

                        continue;
                    }

                    $remainingQuantity = round(
                        ((float) $purchaseOrderItem->ordered_quantity) - ((float) ($purchaseOrderItem->getAttribute('received_quantity_total') ?? 0)),
                        2,
                    );

                    if ($remainingQuantity <= 0) {
                        $validator->errors()->add("items.{$index}.received_quantity", 'The selected purchase-order line is already fully received.');

                        continue;
                    }

                    if ((float) ($item['received_quantity'] ?? 0) > $remainingQuantity) {
                        $validator->errors()->add("items.{$index}.received_quantity", 'The received quantity exceeds the remaining quantity for the selected purchase-order line.');
                    }
                }
            },
        ];
    }
}
