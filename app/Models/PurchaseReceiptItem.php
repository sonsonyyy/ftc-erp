<?php

namespace App\Models;

use Database\Factories\PurchaseReceiptItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'purchase_receipt_id',
    'purchase_order_item_id',
    'inventory_item_id',
    'received_quantity',
    'unit_cost',
    'remarks',
])]
class PurchaseReceiptItem extends Model
{
    /** @use HasFactory<PurchaseReceiptItemFactory> */
    use HasFactory;

    /**
     * Get the receipt linked to the line item.
     *
     * @return BelongsTo<PurchaseReceipt, $this>
     */
    public function purchaseReceipt(): BelongsTo
    {
        return $this->belongsTo(PurchaseReceipt::class);
    }

    /**
     * Get the purchase-order line linked to the receipt line.
     *
     * @return BelongsTo<PurchaseOrderItem, $this>
     */
    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    /**
     * Get the inventory item referenced by the receipt line.
     *
     * @return BelongsTo<InventoryItem, $this>
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'received_quantity' => 'decimal:2',
            'unit_cost' => 'decimal:2',
        ];
    }
}
