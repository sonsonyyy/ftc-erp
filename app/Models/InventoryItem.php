<?php

namespace App\Models;

use App\Enums\InventoryItemStatus;
use Database\Factories\InventoryItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'sku',
    'item_code',
    'item_name',
    'inventory_category_id',
    'unit',
    'reorder_level',
    'standard_cost',
    'status',
    'notes',
])]
class InventoryItem extends Model
{
    /** @use HasFactory<InventoryItemFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => InventoryItemStatus::Active->value,
        'reorder_level' => 0,
    ];

    /**
     * Get the category assigned to the item.
     *
     * @return BelongsTo<InventoryCategory, $this>
     */
    public function inventoryCategory(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class);
    }

    /**
     * Get the stock balances across warehouses for the item.
     *
     * @return HasMany<StockBalance, $this>
     */
    public function stockBalances(): HasMany
    {
        return $this->hasMany(StockBalance::class);
    }

    /**
     * Get the stock movements recorded for the item.
     *
     * @return HasMany<StockMovement, $this>
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class)
            ->orderByDesc('movement_date')
            ->orderByDesc('id');
    }

    /**
     * Get the issuance items linked to the inventory item.
     *
     * @return HasMany<StockIssuanceItem, $this>
     */
    public function stockIssuanceItems(): HasMany
    {
        return $this->hasMany(StockIssuanceItem::class);
    }

    /**
     * Get the return items linked to the inventory item.
     *
     * @return HasMany<StockReturnItem, $this>
     */
    public function stockReturnItems(): HasMany
    {
        return $this->hasMany(StockReturnItem::class);
    }

    /**
     * Scope a query to search inventory items.
     *
     * @param  Builder<InventoryItem>  $query
     * @return Builder<InventoryItem>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        $operator = $query->getConnection()->getDriverName() === 'pgsql'
            ? 'ilike'
            : 'like';

        return $query->where(function (Builder $builder) use ($term, $operator): void {
            $builder
                ->where('sku', $operator, "%{$term}%")
                ->orWhere('item_code', $operator, "%{$term}%")
                ->orWhere('item_name', $operator, "%{$term}%")
                ->orWhere('unit', $operator, "%{$term}%")
                ->orWhere('notes', $operator, "%{$term}%")
                ->orWhereHas('inventoryCategory', function (Builder $categoryQuery) use ($term, $operator): void {
                    $categoryQuery->where('name', $operator, "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by category.
     *
     * @param  Builder<InventoryItem>  $query
     * @return Builder<InventoryItem>
     */
    public function scopeForCategory(Builder $query, ?int $categoryId): Builder
    {
        return filled($categoryId)
            ? $query->where('inventory_category_id', $categoryId)
            : $query;
    }

    /**
     * Scope a query to filter by status.
     *
     * @param  Builder<InventoryItem>  $query
     * @return Builder<InventoryItem>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status)
            ? $query->where('status', $status)
            : $query;
    }

    /**
     * Scope a query to include quantity on hand with an optional warehouse filter.
     *
     * @param  Builder<InventoryItem>  $query
     * @return Builder<InventoryItem>
     */
    public function scopeWithQuantityOnHand(
        Builder $query,
        ?int $warehouseId = null,
        string $alias = 'quantity_on_hand',
    ): Builder {
        if (filled($warehouseId)) {
            return $query->withSum([
                "stockBalances as {$alias}" => fn (Builder $builder) => $builder->where('warehouse_id', $warehouseId),
            ], 'quantity_on_hand');
        }

        return $query->withSum("stockBalances as {$alias}", 'quantity_on_hand');
    }

    /**
     * Scope a query to items currently below reorder level.
     *
     * @param  Builder<InventoryItem>  $query
     * @return Builder<InventoryItem>
     */
    public function scopeBelowReorderLevel(Builder $query, ?int $warehouseId = null): Builder
    {
        if (filled($warehouseId)) {
            return $query->whereRaw(
                'COALESCE((SELECT SUM(stock_balances.quantity_on_hand) FROM stock_balances WHERE stock_balances.inventory_item_id = inventory_items.id AND stock_balances.warehouse_id = ?), 0) < inventory_items.reorder_level',
                [$warehouseId],
            );
        }

        return $query->whereRaw(
            'COALESCE((SELECT SUM(stock_balances.quantity_on_hand) FROM stock_balances WHERE stock_balances.inventory_item_id = inventory_items.id), 0) < inventory_items.reorder_level',
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reorder_level' => 'decimal:2',
            'standard_cost' => 'decimal:2',
            'status' => InventoryItemStatus::class,
        ];
    }
}
