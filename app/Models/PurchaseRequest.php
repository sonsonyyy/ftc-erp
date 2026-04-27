<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\PurchaseRequestStatus;
use Database\Factories\PurchaseRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'request_no',
    'supplier_id',
    'project_id',
    'work_order_id',
    'requested_by_user_id',
    'request_date',
    'needed_by',
    'status',
    'purpose',
    'remarks',
])]
class PurchaseRequest extends Model
{
    /** @use HasFactory<PurchaseRequestFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => PurchaseRequestStatus::Draft->value,
    ];

    /**
     * Get the preferred supplier linked to the purchase request.
     *
     * @return BelongsTo<Supplier, $this>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the project context linked to the purchase request.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the work-order context linked to the purchase request.
     *
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Get the user who prepared the purchase request.
     *
     * @return BelongsTo<User, $this>
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    /**
     * Get the line items linked to the purchase request.
     *
     * @return HasMany<PurchaseRequestItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequestItem::class)
            ->orderBy('id');
    }

    /**
     * Get the purchase orders generated from the purchase request.
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
     * Scope a query to search purchase requests.
     *
     * @param  Builder<PurchaseRequest>  $query
     * @return Builder<PurchaseRequest>
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
                ->where('request_no', $likeOperator, "%{$term}%")
                ->orWhere('purpose', $likeOperator, "%{$term}%")
                ->orWhere('remarks', $likeOperator, "%{$term}%")
                ->orWhereHas('supplier', function (Builder $supplierQuery) use ($likeOperator, $term): void {
                    $supplierQuery
                        ->where('supplier_code', $likeOperator, "%{$term}%")
                        ->orWhere('company_name', $likeOperator, "%{$term}%");
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
     * Scope a query to filter purchase requests by supplier.
     *
     * @param  Builder<PurchaseRequest>  $query
     * @return Builder<PurchaseRequest>
     */
    public function scopeForSupplier(Builder $query, ?int $supplierId): Builder
    {
        return filled($supplierId)
            ? $query->where('supplier_id', $supplierId)
            : $query;
    }

    /**
     * Scope a query to filter purchase requests by status.
     *
     * @param  Builder<PurchaseRequest>  $query
     * @return Builder<PurchaseRequest>
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
            'request_date' => 'date',
            'needed_by' => 'date',
            'status' => PurchaseRequestStatus::class,
        ];
    }
}
