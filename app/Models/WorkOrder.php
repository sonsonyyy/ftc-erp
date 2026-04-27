<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use Database\Factories\WorkOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'quotation_id',
    'project_id',
    'customer_id',
    'customer_site_id',
    'work_order_no',
    'service_type',
    'scheduled_date',
    'priority',
    'status',
    'summary',
    'findings',
    'completion_date',
])]
class WorkOrder extends Model
{
    /** @use HasFactory<WorkOrderFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'priority' => WorkOrderPriority::Normal->value,
        'status' => WorkOrderStatus::Draft->value,
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
     * Get the linked project.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
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
     * Get the linked site.
     *
     * @return BelongsTo<CustomerSite, $this>
     */
    public function customerSite(): BelongsTo
    {
        return $this->belongsTo(CustomerSite::class);
    }

    /**
     * Get the work order assignments.
     *
     * @return HasMany<WorkOrderAssignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(WorkOrderAssignment::class)
            ->orderByDesc('assigned_at')
            ->orderByDesc('id');
    }

    /**
     * Get the work order activity logs.
     *
     * @return HasMany<WorkOrderLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(WorkOrderLog::class)
            ->orderByDesc('logged_at')
            ->orderByDesc('id');
    }

    /**
     * Get the work order material entries.
     *
     * @return HasMany<WorkOrderMaterial, $this>
     */
    public function materials(): HasMany
    {
        return $this->hasMany(WorkOrderMaterial::class)
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    /**
     * Scope a query to search work order records.
     *
     * @param  Builder<WorkOrder>  $query
     * @return Builder<WorkOrder>
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
                ->where('work_order_no', $operator, "%{$term}%")
                ->orWhere('summary', $operator, "%{$term}%")
                ->orWhere('findings', $operator, "%{$term}%")
                ->orWhere('service_type', $operator, "%{$term}%")
                ->orWhereHas('customer', function (Builder $customerQuery) use ($term, $operator): void {
                    $customerQuery
                        ->where('customer_code', $operator, "%{$term}%")
                        ->orWhere('company_name', $operator, "%{$term}%")
                        ->orWhere('trade_name', $operator, "%{$term}%");
                })
                ->orWhereHas('customerSite', function (Builder $siteQuery) use ($term, $operator): void {
                    $siteQuery
                        ->where('site_code', $operator, "%{$term}%")
                        ->orWhere('site_name', $operator, "%{$term}%");
                })
                ->orWhereHas('project', function (Builder $projectQuery) use ($term, $operator): void {
                    $projectQuery
                        ->where('project_no', $operator, "%{$term}%")
                        ->orWhere('title', $operator, "%{$term}%");
                })
                ->orWhereHas('quotation', function (Builder $quotationQuery) use ($term, $operator): void {
                    $quotationQuery
                        ->where('quotation_no', $operator, "%{$term}%")
                        ->orWhere('subject', $operator, "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by customer.
     *
     * @param  Builder<WorkOrder>  $query
     * @return Builder<WorkOrder>
     */
    public function scopeForCustomer(Builder $query, ?int $customerId): Builder
    {
        return filled($customerId)
            ? $query->where('customer_id', $customerId)
            : $query;
    }

    /**
     * Scope a query to filter by project.
     *
     * @param  Builder<WorkOrder>  $query
     * @return Builder<WorkOrder>
     */
    public function scopeForProject(Builder $query, ?int $projectId): Builder
    {
        return filled($projectId)
            ? $query->where('project_id', $projectId)
            : $query;
    }

    /**
     * Scope a query to filter by status.
     *
     * @param  Builder<WorkOrder>  $query
     * @return Builder<WorkOrder>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status)
            ? $query->where('status', $status)
            : $query;
    }

    /**
     * Scope a query to filter by priority.
     *
     * @param  Builder<WorkOrder>  $query
     * @return Builder<WorkOrder>
     */
    public function scopePriority(Builder $query, ?string $priority): Builder
    {
        return filled($priority)
            ? $query->where('priority', $priority)
            : $query;
    }

    /**
     * Scope a query to filter by service type.
     *
     * @param  Builder<WorkOrder>  $query
     * @return Builder<WorkOrder>
     */
    public function scopeServiceType(Builder $query, ?string $serviceType): Builder
    {
        return filled($serviceType)
            ? $query->where('service_type', $serviceType)
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
            'scheduled_date' => 'date',
            'completion_date' => 'date',
            'priority' => WorkOrderPriority::class,
            'service_type' => WorkOrderServiceType::class,
            'status' => WorkOrderStatus::class,
        ];
    }
}
