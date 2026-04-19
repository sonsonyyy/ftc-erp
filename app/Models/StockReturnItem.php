<?php

namespace App\Models;

use Database\Factories\StockReturnItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'stock_return_id',
    'inventory_item_id',
    'quantity',
    'remarks',
])]
class StockReturnItem extends Model
{
    /** @use HasFactory<StockReturnItemFactory> */
    use HasFactory;

    /**
     * Get the return header.
     *
     * @return BelongsTo<StockReturn, $this>
     */
    public function stockReturn(): BelongsTo
    {
        return $this->belongsTo(StockReturn::class);
    }

    /**
     * Get the returned inventory item.
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
