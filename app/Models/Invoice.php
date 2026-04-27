<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\InvoiceStatus;
use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'invoice_no',
    'quotation_id',
    'customer_id',
    'project_id',
    'work_order_id',
    'issued_by_user_id',
    'invoice_date',
    'due_date',
    'subtotal',
    'tax_amount',
    'total_amount',
    'balance_amount',
    'status',
    'remarks',
    'submitted_at',
    'submitted_by_user_id',
    'approved_at',
    'approved_by_user_id',
    'approval_notes',
])]
class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => InvoiceStatus::Draft->value,
        'subtotal' => '0.00',
        'tax_amount' => '0.00',
        'total_amount' => '0.00',
        'balance_amount' => '0.00',
    ];

    /**
     * Get the linked quotation.
     *
     * @return BelongsTo<Quotation, $this>
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Get the linked customer.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
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
     * Get the user who issued the invoice record.
     *
     * @return BelongsTo<User, $this>
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }

    /**
     * Get the user who submitted the invoice for approval.
     *
     * @return BelongsTo<User, $this>
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id')->withTrashed();
    }

    /**
     * Get the user who approved and issued the invoice.
     *
     * @return BelongsTo<User, $this>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id')->withTrashed();
    }

    /**
     * Get the invoice line items.
     *
     * @return HasMany<InvoiceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('id');
    }

    /**
     * Get the payment allocation rows applied to the invoice.
     *
     * @return HasMany<PaymentAllocation, $this>
     */
    public function paymentAllocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class)
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    /**
     * Get the payments linked through allocations.
     *
     * @return BelongsToMany<Payment, $this>
     */
    public function payments(): BelongsToMany
    {
        return $this->belongsToMany(Payment::class, 'payment_allocations')
            ->withPivot('allocated_amount')
            ->withTimestamps();
    }

    /**
     * Scope a query to search invoice records.
     *
     * @param  Builder<Invoice>  $query
     * @return Builder<Invoice>
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
                ->where('invoice_no', $likeOperator, "%{$term}%")
                ->orWhere('remarks', $likeOperator, "%{$term}%")
                ->orWhereHas('customer', function (Builder $customerQuery) use ($likeOperator, $term): void {
                    $customerQuery
                        ->where('customer_code', $likeOperator, "%{$term}%")
                        ->orWhere('company_name', $likeOperator, "%{$term}%")
                        ->orWhere('trade_name', $likeOperator, "%{$term}%");
                })
                ->orWhereHas('quotation', function (Builder $quotationQuery) use ($likeOperator, $term): void {
                    $quotationQuery
                        ->where('quotation_no', $likeOperator, "%{$term}%")
                        ->orWhere('subject', $likeOperator, "%{$term}%");
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
     * Scope a query to filter by customer.
     *
     * @param  Builder<Invoice>  $query
     * @return Builder<Invoice>
     */
    public function scopeForCustomer(Builder $query, ?int $customerId): Builder
    {
        return filled($customerId)
            ? $query->where('customer_id', $customerId)
            : $query;
    }

    /**
     * Scope a query to filter by billing status.
     *
     * @param  Builder<Invoice>  $query
     * @return Builder<Invoice>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        if (! filled($status)) {
            return $query;
        }

        $today = now()->toDateString();

        return match ($status) {
            InvoiceStatus::Overdue->value => $query
                ->whereIn('status', [
                    InvoiceStatus::Issued->value,
                    InvoiceStatus::PartiallyPaid->value,
                ])
                ->where('balance_amount', '>', 0)
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', $today),
            InvoiceStatus::Issued->value => $query
                ->where('status', InvoiceStatus::Issued->value)
                ->where('balance_amount', '>', 0)
                ->where(function (Builder $builder) use ($today): void {
                    $builder
                        ->whereNull('due_date')
                        ->orWhereDate('due_date', '>=', $today);
                }),
            InvoiceStatus::PartiallyPaid->value => $query
                ->where('status', InvoiceStatus::PartiallyPaid->value)
                ->where('balance_amount', '>', 0)
                ->where(function (Builder $builder) use ($today): void {
                    $builder
                        ->whereNull('due_date')
                        ->orWhereDate('due_date', '>=', $today);
                }),
            default => $query->where('status', $status),
        };
    }

    /**
     * Scope a query to filter by invoice date range.
     *
     * @param  Builder<Invoice>  $query
     * @return Builder<Invoice>
     */
    public function scopeBetweenInvoiceDates(Builder $query, ?string $from, ?string $to): Builder
    {
        if (filled($from)) {
            $query->whereDate('invoice_date', '>=', $from);
        }

        if (filled($to)) {
            $query->whereDate('invoice_date', '<=', $to);
        }

        return $query;
    }

    /**
     * Resolve the effective billing status shown to users.
     */
    public function currentStatus(): InvoiceStatus
    {
        $status = $this->status instanceof InvoiceStatus
            ? $this->status
            : InvoiceStatus::from($this->status);

        if (in_array($status, [
            InvoiceStatus::Draft,
            InvoiceStatus::Paid,
            InvoiceStatus::Cancelled,
        ], true)) {
            return $status;
        }

        return $this->due_date !== null
            && (float) $this->balance_amount > 0
            && $this->due_date->isPast()
                ? InvoiceStatus::Overdue
                : $status;
    }

    /**
     * Determine whether the invoice still accepts payments.
     */
    public function allowsPayments(): bool
    {
        return $this->currentStatus()->allowsPayments()
            && (float) $this->balance_amount > 0;
    }

    /**
     * Get the amount already settled on the invoice.
     */
    public function paidAmount(): float
    {
        return round(max((float) $this->total_amount - (float) $this->balance_amount, 0), 2);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'balance_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'status' => InvoiceStatus::class,
        ];
    }
}
