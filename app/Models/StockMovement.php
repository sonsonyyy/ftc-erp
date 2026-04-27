<?php

namespace App\Models;

use App\Enums\StockMovementType;
use Database\Factories\StockMovementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'inventory_item_id',
    'warehouse_id',
    'project_id',
    'work_order_id',
    'reference_type',
    'reference_id',
    'reference_number',
    'movement_type',
    'quantity',
    'balance_after',
    'unit_cost',
    'movement_date',
    'remarks',
    'created_by',
])]
class StockMovement extends Model
{
    /** @use HasFactory<StockMovementFactory> */
    use HasFactory;

    /**
     * Get the inventory item affected by the movement.
     *
     * @return BelongsTo<InventoryItem, $this>
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the warehouse affected by the movement.
     *
     * @return BelongsTo<Warehouse, $this>
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Get the linked project.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the linked work order.
     *
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Get the user who recorded the movement.
     *
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to search movement records.
     *
     * @param  Builder<StockMovement>  $query
     * @return Builder<StockMovement>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        $likeOperator = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        return $query->where(function (Builder $builder) use ($likeOperator, $term): void {
            $builder
                ->where('reference_number', $likeOperator, "%{$term}%")
                ->orWhere('remarks', $likeOperator, "%{$term}%")
                ->orWhereHas('inventoryItem', function (Builder $itemQuery) use ($likeOperator, $term): void {
                    $itemQuery
                        ->where('item_code', $likeOperator, "%{$term}%")
                        ->orWhere('item_name', $likeOperator, "%{$term}%")
                        ->orWhere('sku', $likeOperator, "%{$term}%");
                })
                ->orWhereHas('warehouse', function (Builder $warehouseQuery) use ($likeOperator, $term): void {
                    $warehouseQuery
                        ->where('warehouse_code', $likeOperator, "%{$term}%")
                        ->orWhere('warehouse_name', $likeOperator, "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by warehouse.
     *
     * @param  Builder<StockMovement>  $query
     * @return Builder<StockMovement>
     */
    public function scopeForWarehouse(Builder $query, ?int $warehouseId): Builder
    {
        return filled($warehouseId)
            ? $query->where('warehouse_id', $warehouseId)
            : $query;
    }

    /**
     * Scope a query to filter by item.
     *
     * @param  Builder<StockMovement>  $query
     * @return Builder<StockMovement>
     */
    public function scopeForItem(Builder $query, ?int $inventoryItemId): Builder
    {
        return filled($inventoryItemId)
            ? $query->where('inventory_item_id', $inventoryItemId)
            : $query;
    }

    /**
     * Scope a query to filter by movement type.
     *
     * @param  Builder<StockMovement>  $query
     * @return Builder<StockMovement>
     */
    public function scopeType(Builder $query, ?string $movementType): Builder
    {
        return filled($movementType)
            ? $query->where('movement_type', $movementType)
            : $query;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'movement_date' => 'date',
            'quantity' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'movement_type' => StockMovementType::class,
        ];
    }
}
