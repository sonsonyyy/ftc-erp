<?php

namespace App\Models;

use Database\Factories\StockReturnFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'return_no',
    'warehouse_id',
    'project_id',
    'work_order_id',
    'returned_date',
    'remarks',
    'created_by',
])]
class StockReturn extends Model
{
    /** @use HasFactory<StockReturnFactory> */
    use HasFactory;

    /**
     * Get the warehouse that received the stock.
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
     * Get the user who created the return.
     *
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the returned item rows.
     *
     * @return HasMany<StockReturnItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockReturnItem::class)->orderBy('id');
    }

    /**
     * Scope a query to search return records.
     *
     * @param  Builder<StockReturn>  $query
     * @return Builder<StockReturn>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('return_no', 'like', "%{$term}%")
                ->orWhere('remarks', 'like', "%{$term}%")
                ->orWhereHas('warehouse', function (Builder $warehouseQuery) use ($term): void {
                    $warehouseQuery
                        ->where('warehouse_code', 'like', "%{$term}%")
                        ->orWhere('warehouse_name', 'like', "%{$term}%");
                })
                ->orWhereHas('project', function (Builder $projectQuery) use ($term): void {
                    $projectQuery
                        ->where('project_no', 'like', "%{$term}%")
                        ->orWhere('title', 'like', "%{$term}%");
                })
                ->orWhereHas('workOrder', function (Builder $workOrderQuery) use ($term): void {
                    $workOrderQuery
                        ->where('work_order_no', 'like', "%{$term}%")
                        ->orWhere('summary', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by warehouse.
     *
     * @param  Builder<StockReturn>  $query
     * @return Builder<StockReturn>
     */
    public function scopeForWarehouse(Builder $query, ?int $warehouseId): Builder
    {
        return filled($warehouseId)
            ? $query->where('warehouse_id', $warehouseId)
            : $query;
    }

    /**
     * Scope a query to filter by project.
     *
     * @param  Builder<StockReturn>  $query
     * @return Builder<StockReturn>
     */
    public function scopeForProject(Builder $query, ?int $projectId): Builder
    {
        return filled($projectId)
            ? $query->where('project_id', $projectId)
            : $query;
    }

    /**
     * Scope a query to filter by work order.
     *
     * @param  Builder<StockReturn>  $query
     * @return Builder<StockReturn>
     */
    public function scopeForWorkOrder(Builder $query, ?int $workOrderId): Builder
    {
        return filled($workOrderId)
            ? $query->where('work_order_id', $workOrderId)
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
            'returned_date' => 'date',
        ];
    }
}
