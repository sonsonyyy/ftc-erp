<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use Database\Factories\CustomerSiteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'customer_id',
    'site_code',
    'site_name',
    'contact_person',
    'contact_no',
    'email',
    'address',
    'city',
    'province',
    'notes',
    'is_active',
])]
class CustomerSite extends Model
{
    /** @use HasFactory<CustomerSiteFactory> */
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
     * Get the customer that owns the site.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Scope a query to search customer site records.
     *
     * @param  Builder<CustomerSite>  $query
     * @return Builder<CustomerSite>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('site_code', 'like', "%{$term}%")
                ->orWhere('site_name', 'like', "%{$term}%")
                ->orWhere('contact_person', 'like', "%{$term}%")
                ->orWhere('contact_no', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->orWhere('address', 'like', "%{$term}%")
                ->orWhere('city', 'like', "%{$term}%")
                ->orWhere('province', 'like', "%{$term}%")
                ->orWhereHas('customer', function (Builder $customerQuery) use ($term): void {
                    $customerQuery
                        ->where('customer_code', 'like', "%{$term}%")
                        ->orWhere('company_name', 'like', "%{$term}%")
                        ->orWhere('trade_name', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter sites by the parent customer.
     *
     * @param  Builder<CustomerSite>  $query
     * @return Builder<CustomerSite>
     */
    public function scopeForCustomer(Builder $query, ?int $customerId): Builder
    {
        return filled($customerId)
            ? $query->where('customer_id', $customerId)
            : $query;
    }

    /**
     * Scope a query to filter by activity flag.
     *
     * @param  Builder<CustomerSite>  $query
     * @return Builder<CustomerSite>
     */
    public function scopeActive(Builder $query, ?string $isActive): Builder
    {
        return match ($isActive) {
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
