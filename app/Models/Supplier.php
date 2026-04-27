<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use Database\Factories\SupplierFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'supplier_code',
    'company_name',
    'contact_person',
    'phone',
    'email',
    'tin',
    'address',
    'payment_terms',
    'is_active',
    'notes',
])]
class Supplier extends Model
{
    /** @use HasFactory<SupplierFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * Get the purchase requests linked to the supplier.
     *
     * @return HasMany<PurchaseRequest, $this>
     */
    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class)
            ->orderByDesc('request_date')
            ->orderByDesc('id');
    }

    /**
     * Get the purchase orders linked to the supplier.
     *
     * @return HasMany<PurchaseOrder, $this>
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class)
            ->orderByDesc('order_date')
            ->orderByDesc('id');
    }

    /**
     * Scope a query to search supplier records.
     *
     * @param  Builder<Supplier>  $query
     * @return Builder<Supplier>
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
                ->where('supplier_code', $likeOperator, "%{$term}%")
                ->orWhere('company_name', $likeOperator, "%{$term}%")
                ->orWhere('contact_person', $likeOperator, "%{$term}%")
                ->orWhere('phone', $likeOperator, "%{$term}%")
                ->orWhere('email', $likeOperator, "%{$term}%")
                ->orWhere('tin', $likeOperator, "%{$term}%")
                ->orWhere('payment_terms', $likeOperator, "%{$term}%")
                ->orWhere('notes', $likeOperator, "%{$term}%");
        });
    }

    /**
     * Scope a query to filter supplier records by activity.
     *
     * @param  Builder<Supplier>  $query
     * @return Builder<Supplier>
     */
    public function scopeActive(Builder $query, ?string $activity): Builder
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
