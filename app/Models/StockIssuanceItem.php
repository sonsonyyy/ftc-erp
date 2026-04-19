<?php

namespace App\Models;

use Database\Factories\StockIssuanceItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'stock_issuance_id',
    'inventory_item_id',
    'quantity',
    'remarks',
])]
class StockIssuanceItem extends Model
{
    /** @use HasFactory<StockIssuanceItemFactory> */
    use HasFactory;

    /**
     * Get the issuance header.
     *
     * @return BelongsTo<StockIssuance, $this>
     */
    public function stockIssuance(): BelongsTo
    {
        return $this->belongsTo(StockIssuance::class);
    }

    /**
     * Get the issued inventory item.
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
            'quantity' => 'decimal:2',
        ];
    }
}
