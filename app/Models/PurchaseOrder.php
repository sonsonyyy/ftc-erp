<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\PurchaseOrderStatus;
use Database\Factories\PurchaseOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'po_no',
    'purchase_request_id',
    'supplier_id',
    'project_id',
    'work_order_id',
    'ordered_by_user_id',
    'order_date',
    'expected_date',
    'status',
    'supplier_reference',
    'remarks',
    'submitted_at',
    'submitted_by_user_id',
    'approved_at',
    'approved_by_user_id',
    'approval_notes',
])]
class PurchaseOrder extends Model
{
    /** @use HasFactory<PurchaseOrderFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => PurchaseOrderStatus::Draft->value,
    ];

    /**
     * Get the supplier linked to the purchase order.
     *
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the purchase request linked to the purchase order.
     *
     * @return BelongsTo<PurchaseRequest, $this>
     */
    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    /**
     * Get the project context linked to the purchase order.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the work-order context linked to the purchase order.
     *
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Get the user who prepared the purchase order.
     *
     * @return BelongsTo<User, $this>
     */
    public function orderedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ordered_by_user_id');
    }

    /**
     * Get the user who submitted the purchase order for approval.
     *
     * @return BelongsTo<User, $this>
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id')->withTrashed();
    }

    /**
     * Get the user who approved the purchase order.
     *
     * @return BelongsTo<User, $this>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id')->withTrashed();
    }

    /**
     * Get the purchase-order line items.
     *
     * @return HasMany<PurchaseOrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class)
            ->orderBy('id');
    }

    /**
     * Get the receipts recorded against the purchase order.
     *
     * @return HasMany<PurchaseReceipt, $this>
     */
    public function receipts(): HasMany
    {
        return $this->hasMany(PurchaseReceipt::class)
            ->orderByDesc('received_date')
            ->orderByDesc('id');
    }

    /**
     * Get all receipt items linked to the purchase order.
     *
     * @return HasManyThrough<PurchaseReceiptItem, PurchaseReceipt, $this>
     */
    public function receiptItems(): HasManyThrough
    {
        return $this->hasManyThrough(PurchaseReceiptItem::class, PurchaseReceipt::class);
    }

    /**
     * Scope a query to search purchase orders.
     *
     * @param  Builder<PurchaseOrder>  $query
     * @return Builder<PurchaseOrder>
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
                ->where('po_no', $likeOperator, "%{$term}%")
                ->orWhere('supplier_reference', $likeOperator, "%{$term}%")
                ->orWhere('remarks', $likeOperator, "%{$term}%")
                ->orWhereHas('supplier', function (Builder $supplierQuery) use ($likeOperator, $term): void {
                    $supplierQuery
                        ->where('supplier_code', $likeOperator, "%{$term}%")
                        ->orWhere('company_name', $likeOperator, "%{$term}%");
                })
                ->orWhereHas('purchaseRequest', function (Builder $requestQuery) use ($likeOperator, $term): void {
                    $requestQuery
                        ->where('request_no', $likeOperator, "%{$term}%")
                        ->orWhere('purpose', $likeOperator, "%{$term}%");
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
     * Scope a query to filter purchase orders by supplier.
     *
     * @param  Builder<PurchaseOrder>  $query
     * @return Builder<PurchaseOrder>
     */
    public function scopeForSupplier(Builder $query, ?int $supplierId): Builder
    {
        return filled($supplierId)
            ? $query->where('supplier_id', $supplierId)
            : $query;
    }

    /**
     * Scope a query to filter purchase orders by status.
     *
     * @param  Builder<PurchaseOrder>  $query
     * @return Builder<PurchaseOrder>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status)
            ? $query->where('status', $status)
            : $query;
    }

    /**
     * Determine if the purchase order still has receivable quantities.
     */
    public function hasReceivableItems(): bool
    {
        $orderedQuantity = (float) ($this->getAttribute('ordered_quantity_total') ?? 0);
        $receivedQuantity = (float) ($this->getAttribute('received_quantity_total') ?? 0);

        if ($orderedQuantity === 0.0) {
            $orderedQuantity = $this->items()->sum('ordered_quantity');
        }

        if ($receivedQuantity === 0.0) {
            $receivedQuantity = $this->receiptItems()->sum('received_quantity');
        }

        return round($orderedQuantity - $receivedQuantity, 2) > 0;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'expected_date' => 'date',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'status' => PurchaseOrderStatus::class,
        ];
    }
}
