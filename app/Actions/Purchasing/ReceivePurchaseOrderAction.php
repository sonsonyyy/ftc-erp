<?php

namespace App\Actions\Purchasing;

use App\Actions\Inventory\StockLedgerService;
use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReceivePurchaseOrderAction
{
    /**
     * Create a new action instance.
     */
    public function __construct(private readonly StockLedgerService $stockLedgerService) {}

    /**
     * Receive stock against the selected purchase order.
     *
     * @param  array<string, mixed>  $validated
     */
    public function handle(PurchaseOrder $purchaseOrder, array $validated, ?User $user): PurchaseReceipt
    {
        /** @var PurchaseReceipt $purchaseReceipt */
        $purchaseReceipt = DB::transaction(function () use ($purchaseOrder, $validated, $user): PurchaseReceipt {
            $purchaseOrder->load([
                'items' => fn ($query) => $query->withSum('receiptItems as received_quantity_total', 'received_quantity'),
            ]);

            if (! $purchaseOrder->status->allowsReceiving()) {
                throw ValidationException::withMessages([
                    'status' => 'Only approved purchase orders can be received.',
                ]);
            }

            $purchaseReceipt = PurchaseReceipt::query()->create([
                'receipt_no' => $validated['receipt_no'],
                'purchase_order_id' => $purchaseOrder->getKey(),
                'warehouse_id' => $validated['warehouse_id'],
                'received_by_user_id' => $user?->getKey(),
                'received_date' => $validated['received_date'],
                'supplier_reference' => $validated['supplier_reference'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            /** @var array<int, PurchaseOrderItem> $purchaseOrderItems */
            $purchaseOrderItems = $purchaseOrder->items->keyBy('id')->all();

            foreach ($validated['items'] as $index => $item) {
                /** @var PurchaseOrderItem $purchaseOrderItem */
                $purchaseOrderItem = $purchaseOrderItems[(int) $item['purchase_order_item_id']];
                $alreadyReceived = (float) ($purchaseOrderItem->getAttribute('received_quantity_total') ?? 0);
                $remainingQuantity = round(((float) $purchaseOrderItem->ordered_quantity) - $alreadyReceived, 2);
                $receivedQuantity = round((float) $item['received_quantity'], 2);

                if ($receivedQuantity > $remainingQuantity) {
                    throw ValidationException::withMessages([
                        "items.{$index}.received_quantity" => 'The received quantity exceeds the remaining purchase-order quantity.',
                    ]);
                }

                PurchaseReceiptItem::query()->create([
                    'purchase_receipt_id' => $purchaseReceipt->getKey(),
                    'purchase_order_item_id' => $purchaseOrderItem->getKey(),
                    'inventory_item_id' => $purchaseOrderItem->inventory_item_id,
                    'received_quantity' => $receivedQuantity,
                    'unit_cost' => $purchaseOrderItem->unit_cost,
                    'remarks' => $item['remarks'] ?? null,
                ]);

                $this->stockLedgerService->recordPurchaseReceiptMovement(
                    warehouseId: (int) $validated['warehouse_id'],
                    inventoryItemId: $purchaseOrderItem->inventory_item_id,
                    quantity: $receivedQuantity,
                    user: $user,
                    movementDate: (string) $validated['received_date'],
                    purchaseReceiptId: $purchaseReceipt->getKey(),
                    receiptNo: $purchaseReceipt->receipt_no,
                    remarks: $item['remarks'] ?? ($validated['remarks'] ?? null),
                    unitCost: $purchaseOrderItem->unit_cost,
                    validationKey: "items.{$index}.received_quantity",
                );
            }

            $this->refreshPurchaseOrderStatus($purchaseOrder);

            return $purchaseReceipt;
        });

        return $purchaseReceipt->load([
            'purchaseOrder.supplier',
            'warehouse',
            'receivedBy',
            'items.inventoryItem',
            'attachments.uploadedBy',
        ]);
    }

    /**
     * Update the purchase-order status after receiving.
     */
    private function refreshPurchaseOrderStatus(PurchaseOrder $purchaseOrder): void
    {
        $purchaseOrder->load([
            'items' => fn ($query) => $query->withSum('receiptItems as received_quantity_total', 'received_quantity'),
        ]);

        $orderedQuantity = round((float) $purchaseOrder->items->sum('ordered_quantity'), 2);
        $receivedQuantity = round((float) $purchaseOrder->items->sum(
            fn (PurchaseOrderItem $item) => (float) ($item->getAttribute('received_quantity_total') ?? 0),
        ), 2);

        $nextStatus = $receivedQuantity >= $orderedQuantity
            ? PurchaseOrderStatus::FullyReceived
            : PurchaseOrderStatus::PartiallyReceived;

        $purchaseOrder->update([
            'status' => $nextStatus,
        ]);
    }
}
