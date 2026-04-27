<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\ProjectStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'quotation_id',
    'customer_id',
    'customer_site_id',
    'project_no',
    'title',
    'project_type',
    'start_date',
    'target_end_date',
    'actual_end_date',
    'status',
    'description',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => ProjectStatus::Draft->value,
    ];

    /**
     * Get the quotation linked to the project.
     *
     * @return BelongsTo<Quotation, $this>
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Get the customer linked to the project.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the customer site linked to the project.
     *
     * @return BelongsTo<CustomerSite, $this>
     */
    public function customerSite(): BelongsTo
    {
        return $this->belongsTo(CustomerSite::class);
    }

    /**
     * Get the project assignments.
     *
     * @return HasMany<ProjectAssignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(ProjectAssignment::class)
            ->orderByDesc('assigned_at')
            ->orderByDesc('id');
    }

    /**
     * Get the project status history entries.
     *
     * @return HasMany<ProjectStatusLog, $this>
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(ProjectStatusLog::class)
            ->orderByDesc('changed_at')
            ->orderByDesc('id');
    }

    /**
     * Get related work orders for the project.
     *
     * @return HasMany<WorkOrder, $this>
     */
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class)
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id');
    }

    /**
     * Scope a query to search project records.
     *
     * @param  Builder<Project>  $query
     * @return Builder<Project>
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
                ->where('project_no', $operator, "%{$term}%")
                ->orWhere('title', $operator, "%{$term}%")
                ->orWhere('project_type', $operator, "%{$term}%")
                ->orWhere('description', $operator, "%{$term}%")
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
                });
        });
    }

    /**
     * Scope a query to filter by customer.
     *
     * @param  Builder<Project>  $query
     * @return Builder<Project>
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
     * @param  Builder<Project>  $query
     * @return Builder<Project>
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
            'start_date' => 'date',
            'target_end_date' => 'date',
            'actual_end_date' => 'date',
            'status' => ProjectStatus::class,
        ];
    }
}
