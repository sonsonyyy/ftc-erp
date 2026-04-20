<?php

namespace App\Models;

use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'payment_no',
    'customer_id',
    'received_by_user_id',
    'payment_date',
    'amount',
    'payment_method',
    'reference_no',
    'remarks',
])]
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the customer linked to the payment.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who recorded the payment.
     *
     * @return BelongsTo<User, $this>
     */
    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by_user_id');
    }

    /**
     * Get the allocation rows for this payment.
     *
     * @return HasMany<PaymentAllocation, $this>
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class)
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    /**
     * Get the linked invoices through allocations.
     *
     * @return BelongsToMany<Invoice, $this>
     */
    public function invoices(): BelongsToMany
    {
        return $this->belongsToMany(Invoice::class, 'payment_allocations')
            ->withPivot('allocated_amount')
            ->withTimestamps();
    }

    /**
     * Scope a query to search payment records.
     *
     * @param  Builder<Payment>  $query
     * @return Builder<Payment>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('payment_no', 'like', "%{$term}%")
                ->orWhere('payment_method', 'like', "%{$term}%")
                ->orWhere('reference_no', 'like', "%{$term}%")
                ->orWhere('remarks', 'like', "%{$term}%")
                ->orWhereHas('customer', function (Builder $customerQuery) use ($term): void {
                    $customerQuery
                        ->where('customer_code', 'like', "%{$term}%")
                        ->orWhere('company_name', 'like', "%{$term}%")
                        ->orWhere('trade_name', 'like', "%{$term}%");
                })
                ->orWhereHas('allocations.invoice', function (Builder $invoiceQuery) use ($term): void {
                    $invoiceQuery->where('invoice_no', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by customer.
     *
     * @param  Builder<Payment>  $query
     * @return Builder<Payment>
     */
    public function scopeForCustomer(Builder $query, ?int $customerId): Builder
    {
        return filled($customerId)
            ? $query->where('customer_id', $customerId)
            : $query;
    }

    /**
     * Scope a query to filter by payment date range.
     *
     * @param  Builder<Payment>  $query
     * @return Builder<Payment>
     */
    public function scopeBetweenPaymentDates(Builder $query, ?string $from, ?string $to): Builder
    {
        if (filled($from)) {
            $query->whereDate('payment_date', '>=', $from);
        }

        if (filled($to)) {
            $query->whereDate('payment_date', '<=', $to);
        }

        return $query;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }
}
