<?php

namespace App\Models;

use Database\Factories\StockIssuanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'issuance_no',
    'warehouse_id',
    'project_id',
    'work_order_id',
    'issued_date',
    'remarks',
    'created_by',
])]
class StockIssuance extends Model
{
    /** @use HasFactory<StockIssuanceFactory> */
    use HasFactory;

    /**
     * Get the warehouse that issued the stock.
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
     * Get the user who created the issuance.
     *
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the issued item rows.
     *
     * @return HasMany<StockIssuanceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockIssuanceItem::class)->orderBy('id');
    }

    /**
     * Scope a query to search issuance records.
     *
     * @param  Builder<StockIssuance>  $query
     * @return Builder<StockIssuance>
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
                ->where('issuance_no', $likeOperator, "%{$term}%")
                ->orWhere('remarks', $likeOperator, "%{$term}%")
                ->orWhereHas('warehouse', function (Builder $warehouseQuery) use ($likeOperator, $term): void {
                    $warehouseQuery
                        ->where('warehouse_code', $likeOperator, "%{$term}%")
                        ->orWhere('warehouse_name', $likeOperator, "%{$term}%");
                })
                ->orWhereHas('project', function (Builder $projectQuery) use ($likeOperator, $term): void {
                    $projectQuery
                        ->where('project_no', $likeOperator, "%{$term}%")
                        ->orWhere('title', $likeOperator, "%{$term}%");
                })
                ->orWhereHas('workOrder', function (Builder $workOrderQuery) use ($likeOperator, $term): void {
                    $workOrderQuery
                        ->where('work_order_no', $likeOperator, "%{$term}%")
                        ->orWhere('summary', $likeOperator, "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by warehouse.
     *
     * @param  Builder<StockIssuance>  $query
     * @return Builder<StockIssuance>
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
     * @param  Builder<StockIssuance>  $query
     * @return Builder<StockIssuance>
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
     * @param  Builder<StockIssuance>  $query
     * @return Builder<StockIssuance>
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
            'issued_date' => 'date',
        ];
    }
}
