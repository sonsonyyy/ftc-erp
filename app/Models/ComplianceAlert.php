<?php

namespace App\Models;

use App\Enums\ComplianceAlertType;
use Database\Factories\ComplianceAlertFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'compliance_record_id',
    'alert_type',
    'deadline_type',
    'scheduled_for',
    'reference_date',
    'days_before',
    'message',
    'acknowledged_at',
    'acknowledged_by_user_id',
])]
class ComplianceAlert extends Model
{
    /** @use HasFactory<ComplianceAlertFactory> */
    use HasFactory;

    /**
     * Get the parent compliance record.
     *
     * @return BelongsTo<ComplianceRecord, $this>
     */
    public function complianceRecord(): BelongsTo
    {
        return $this->belongsTo(ComplianceRecord::class);
    }

    /**
     * Get the user who acknowledged the alert.
     *
     * @return BelongsTo<User, $this>
     */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by_user_id')->withTrashed();
    }

    /**
     * Scope a query to filter by acknowledgement state.
     *
     * @param  Builder<ComplianceAlert>  $query
     * @return Builder<ComplianceAlert>
     */
    public function scopeAcknowledged(Builder $query, ?string $state): Builder
    {
        return match ($state) {
            'acknowledged' => $query->whereNotNull('acknowledged_at'),
            'unacknowledged' => $query->whereNull('acknowledged_at'),
            default => $query,
        };
    }

    /**
     * Scope a query to filter by alert type.
     *
     * @param  Builder<ComplianceAlert>  $query
     * @return Builder<ComplianceAlert>
     */
    public function scopeType(Builder $query, ?string $type): Builder
    {
        return filled($type)
            ? $query->where('alert_type', $type)
            : $query;
    }

    /**
     * Scope a query to unacknowledged alerts.
     *
     * @param  Builder<ComplianceAlert>  $query
     * @return Builder<ComplianceAlert>
     */
    public function scopeUnacknowledged(Builder $query): Builder
    {
        return $query->whereNull('acknowledged_at');
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'alert_type' => ComplianceAlertType::class,
            'scheduled_for' => 'date',
            'reference_date' => 'date',
            'acknowledged_at' => 'datetime',
        ];
    }
}
