<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\QuotationStatus;
use Database\Factories\QuotationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'quotation_no',
    'customer_id',
    'customer_site_id',
    'subject',
    'quotation_date',
    'valid_until',
    'quotation_amount',
    'status',
    'prepared_by_user_id',
    'assigned_sales_user_id',
    'materialized_at',
    'converted_project_id',
    'converted_work_order_id',
    'lost_reason',
    'remarks',
])]
class Quotation extends Model
{
    /** @use HasFactory<QuotationFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => QuotationStatus::Draft->value,
    ];

    /**
     * Get the customer linked to the quotation.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the customer site linked to the quotation.
     *
     * @return BelongsTo<CustomerSite, $this>
     */
    public function customerSite(): BelongsTo
    {
        return $this->belongsTo(CustomerSite::class);
    }

    /**
     * Get the user who prepared the quotation record.
     *
     * @return BelongsTo<User, $this>
     */
    public function preparedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by_user_id');
    }

    /**
     * Get the assigned sales user for the quotation.
     *
     * @return BelongsTo<User, $this>
     */
    public function assignedSalesUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_sales_user_id');
    }

    /**
     * Get the converted project linked from this quotation.
     *
     * @return BelongsTo<Project, $this>
     */
    public function convertedProject(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'converted_project_id');
    }

    /**
     * Get the converted work order linked from this quotation.
     *
     * @return BelongsTo<WorkOrder, $this>
     */
    public function convertedWorkOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'converted_work_order_id');
    }

    /**
     * Get the status history entries for the quotation.
     *
     * @return HasMany<QuotationStatusLog, $this>
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(QuotationStatusLog::class)
            ->orderByDesc('changed_at')
            ->orderByDesc('id');
    }

    /**
     * Scope a query to search quotation records.
     *
     * @param  Builder<Quotation>  $query
     * @return Builder<Quotation>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('quotation_no', 'like', "%{$term}%")
                ->orWhere('subject', 'like', "%{$term}%")
                ->orWhere('lost_reason', 'like', "%{$term}%")
                ->orWhereHas('customer', function (Builder $customerQuery) use ($term): void {
                    $customerQuery
                        ->where('customer_code', 'like', "%{$term}%")
                        ->orWhere('company_name', 'like', "%{$term}%")
                        ->orWhere('trade_name', 'like', "%{$term}%");
                })
                ->orWhereHas('customerSite', function (Builder $siteQuery) use ($term): void {
                    $siteQuery
                        ->where('site_code', 'like', "%{$term}%")
                        ->orWhere('site_name', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by customer.
     *
     * @param  Builder<Quotation>  $query
     * @return Builder<Quotation>
     */
    public function scopeForCustomer(Builder $query, ?int $customerId): Builder
    {
        return filled($customerId)
            ? $query->where('customer_id', $customerId)
            : $query;
    }

    /**
     * Scope a query to filter by status.
     *
     * @param  Builder<Quotation>  $query
     * @return Builder<Quotation>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status)
            ? $query->where('status', $status)
            : $query;
    }

    /**
     * Scope a query to filter quotations by quotation date range.
     *
     * @param  Builder<Quotation>  $query
     * @return Builder<Quotation>
     */
    public function scopeBetweenQuotationDates(
        Builder $query,
        ?string $from,
        ?string $to,
    ): Builder {
        if (filled($from)) {
            $query->whereDate('quotation_date', '>=', $from);
        }

        if (filled($to)) {
            $query->whereDate('quotation_date', '<=', $to);
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
            'quotation_date' => 'date',
            'valid_until' => 'date',
            'quotation_amount' => 'decimal:2',
            'status' => QuotationStatus::class,
            'materialized_at' => 'datetime',
        ];
    }
}
