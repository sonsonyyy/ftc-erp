<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\CustomerStatus;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'customer_code',
    'company_name',
    'trade_name',
    'tin',
    'phone',
    'email',
    'billing_address',
    'status',
    'notes',
])]
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => CustomerStatus::Active->value,
    ];

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

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('customer_code', 'like', "%{$term}%")
                ->orWhere('company_name', 'like', "%{$term}%")
                ->orWhere('trade_name', 'like', "%{$term}%")
                ->orWhere('tin', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by status.
     *
     * @param  Builder<Customer>  $query
     * @return Builder<Customer>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status)
            ? $query->where('status', $status)
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
            'status' => CustomerStatus::class,
        ];
    }
}
