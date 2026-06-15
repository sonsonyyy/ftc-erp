<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'customer_code',
    'created_by',
    'company_name',
    'trade_name',
    'tin',
    'phone',
    'email',
    'billing_address',
    'notes',
])]
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * Get the customer sites for the customer.
     *
     * @return HasMany<CustomerSite, $this>
     */
    public function customerSites(): HasMany
    {
        return $this->hasMany(CustomerSite::class);
    }

    /**
     * Get the user that created the customer record.
     *
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to search customer records.
     *
     * @param  Builder<Customer>  $query
     * @return Builder<Customer>
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
                ->where('customer_code', $operator, "%{$term}%")
                ->orWhere('company_name', $operator, "%{$term}%")
                ->orWhere('trade_name', $operator, "%{$term}%")
                ->orWhere('tin', $operator, "%{$term}%")
                ->orWhere('phone', $operator, "%{$term}%")
                ->orWhere('email', $operator, "%{$term}%");
        });
    }
}
