<?php

namespace App\Models;

use Database\Factories\WarehouseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'warehouse_code',
    'warehouse_name',
    'address',
    'contact_person',
    'contact_no',
    'is_active',
    'notes',
])]
class Warehouse extends Model
{
    /** @use HasFactory<WarehouseFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * Get the warehouse stock balances.
     *
     * @return HasMany<StockBalance, $this>
     */
    public function stockBalances(): HasMany
    {
        return $this->hasMany(StockBalance::class);
    }

    /**
     * Get the warehouse stock movements.
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
     * Get the stock issuances from the warehouse.
     *
     * @return HasMany<StockIssuance, $this>
     */
    public function stockIssuances(): HasMany
    {
        return $this->hasMany(StockIssuance::class)
            ->orderByDesc('issued_date')
            ->orderByDesc('id');
    }

    /**
     * Get the stock returns received by the warehouse.
     *
     * @return HasMany<StockReturn, $this>
     */
    public function stockReturns(): HasMany
    {
        return $this->hasMany(StockReturn::class)
            ->orderByDesc('returned_date')
            ->orderByDesc('id');
    }

    /**
     * Scope a query to search warehouse records.
     *
     * @param  Builder<Warehouse>  $query
     * @return Builder<Warehouse>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('warehouse_code', 'like', "%{$term}%")
                ->orWhere('warehouse_name', 'like', "%{$term}%")
                ->orWhere('address', 'like', "%{$term}%")
                ->orWhere('contact_person', 'like', "%{$term}%")
                ->orWhere('contact_no', 'like', "%{$term}%")
                ->orWhere('notes', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by activity state.
     *
     * @param  Builder<Warehouse>  $query
     * @return Builder<Warehouse>
     */
    public function scopeActivity(Builder $query, ?string $activity): Builder
    {
        return match ($activity) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => $query,
        };
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
