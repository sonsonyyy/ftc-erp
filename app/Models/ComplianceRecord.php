<?php

namespace App\Models;

use App\Concerns\HasAttachments;
use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
use Carbon\CarbonInterface;
use Database\Factories\ComplianceRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'record_no',
    'compliance_template_id',
    'title',
    'agency',
    'category',
    'description',
    'due_date',
    'expiry_date',
    'recurrence_unit',
    'reminder_days',
    'assigned_user_id',
    'status',
    'latest_submission_at',
    'latest_submission_reference',
    'notes',
])]
class ComplianceRecord extends Model
{
    /** @use HasFactory<ComplianceRecordFactory> */
    use HasAttachments, HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'recurrence_unit' => ComplianceRecurrenceUnit::None->value,
        'status' => ComplianceRecordStatus::Draft->value,
    ];

    /**
     * Get the master template linked to the record.
     *
     * @return BelongsTo<ComplianceTemplate, $this>
     */
    public function complianceTemplate(): BelongsTo
    {
        return $this->belongsTo(ComplianceTemplate::class)->withTrashed();
    }

    /**
     * Get the responsible user linked to the record.
     *
     * @return BelongsTo<User, $this>
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id')->withTrashed();
    }

    /**
     * Get the reminder and filing tasks linked to the record.
     *
     * @return HasMany<ComplianceTask, $this>
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(ComplianceTask::class)
            ->orderByRaw('completed_at is not null')
            ->orderBy('due_date')
            ->orderBy('id');
    }

    /**
     * Get the generated alerts linked to the record.
     *
     * @return HasMany<ComplianceAlert, $this>
     */
    public function alerts(): HasMany
    {
        return $this->hasMany(ComplianceAlert::class)
            ->orderByDesc('scheduled_for')
            ->orderByDesc('id');
    }

    /**
     * Get the submission history linked to the record.
     *
     * @return HasMany<ComplianceSubmission, $this>
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(ComplianceSubmission::class)
            ->orderByDesc('submitted_at')
            ->orderByDesc('id');
    }

    /**
     * Scope a query to search compliance records.
     *
     * @param  Builder<ComplianceRecord>  $query
     * @return Builder<ComplianceRecord>
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
                ->where('record_no', $operator, "%{$term}%")
                ->orWhere('title', $operator, "%{$term}%")
                ->orWhere('agency', $operator, "%{$term}%")
                ->orWhere('category', $operator, "%{$term}%")
                ->orWhere('description', $operator, "%{$term}%")
                ->orWhere('latest_submission_reference', $operator, "%{$term}%")
                ->orWhere('notes', $operator, "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by agency.
     *
     * @param  Builder<ComplianceRecord>  $query
     * @return Builder<ComplianceRecord>
     */
    public function scopeAgency(Builder $query, ?string $agency): Builder
    {
        return filled($agency)
            ? $query->where('agency', $agency)
            : $query;
    }

    /**
     * Scope a query to filter by responsible user.
     *
     * @param  Builder<ComplianceRecord>  $query
     * @return Builder<ComplianceRecord>
     */
    public function scopeAssignedTo(Builder $query, ?int $userId): Builder
    {
        return filled($userId)
            ? $query->where('assigned_user_id', $userId)
            : $query;
    }

    /**
     * Scope a query to filter by effective display status.
     *
     * @param  Builder<ComplianceRecord>  $query
     * @return Builder<ComplianceRecord>
     */
    public function scopeDisplayStatus(Builder $query, ?string $status, ?CarbonInterface $today = null): Builder
    {
        if (! filled($status)) {
            return $query;
        }

        $currentDate = ($today ?? now())->toDateString();
        $soonDate = ($today ?? now())->copy()->addDays(30)->toDateString();

        return match ($status) {
            ComplianceRecordStatus::Expired->value => $query
                ->where('status', '!=', ComplianceRecordStatus::Archived->value)
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '<', $currentDate),
            ComplianceRecordStatus::Overdue->value => $query
                ->where('status', '!=', ComplianceRecordStatus::Archived->value)
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', $currentDate)
                ->where(function (Builder $builder) use ($currentDate): void {
                    $builder
                        ->whereNull('expiry_date')
                        ->orWhereDate('expiry_date', '>=', $currentDate);
                }),
            ComplianceRecordStatus::ForRenewal->value => $query
                ->where('status', '!=', ComplianceRecordStatus::Archived->value)
                ->whereNotNull('expiry_date')
                ->whereDate('expiry_date', '>=', $currentDate)
                ->whereDate('expiry_date', '<=', $soonDate),
            ComplianceRecordStatus::DueSoon->value => $query
                ->where('status', '!=', ComplianceRecordStatus::Archived->value)
                ->whereNotNull('due_date')
                ->whereDate('due_date', '>=', $currentDate)
                ->whereDate('due_date', '<=', $soonDate),
            default => $query->where('status', $status),
        };
    }

    /**
     * Scope a query to records with deadlines inside a date window.
     *
     * @param  Builder<ComplianceRecord>  $query
     * @return Builder<ComplianceRecord>
     */
    public function scopeWithinDeadlineWindow(Builder $query, string $from, string $to): Builder
    {
        return $query->where(function (Builder $builder) use ($from, $to): void {
            $builder
                ->where(function (Builder $dueQuery) use ($from, $to): void {
                    $dueQuery
                        ->whereNotNull('due_date')
                        ->whereDate('due_date', '>=', $from)
                        ->whereDate('due_date', '<=', $to);
                })
                ->orWhere(function (Builder $expiryQuery) use ($from, $to): void {
                    $expiryQuery
                        ->whereNotNull('expiry_date')
                        ->whereDate('expiry_date', '>=', $from)
                        ->whereDate('expiry_date', '<=', $to);
                });
        });
    }

    /**
     * Get the reminder cadence configured for this record.
     *
     * @return array<int, int>
     */
    public function resolvedReminderDays(): array
    {
        $days = $this->reminder_days
            ?? $this->complianceTemplate?->default_reminder_days
            ?? [90, 60, 30, 15, 7];

        return collect($days)
            ->map(fn (mixed $day): int => (int) $day)
            ->filter(fn (int $day): bool => $day > 0)
            ->unique()
            ->sortDesc()
            ->values()
            ->all();
    }

    /**
     * Determine the effective status shown to users.
     */
    public function displayStatus(?CarbonInterface $today = null): ComplianceRecordStatus
    {
        $currentDate = ($today ?? now())->startOfDay();
        $status = $this->status instanceof ComplianceRecordStatus
            ? $this->status
            : ComplianceRecordStatus::from($this->status);

        if ($status === ComplianceRecordStatus::Archived) {
            return ComplianceRecordStatus::Archived;
        }

        if ($this->expiry_date !== null && $this->expiry_date->lt($currentDate)) {
            return ComplianceRecordStatus::Expired;
        }

        if ($this->due_date !== null && $this->due_date->lt($currentDate)) {
            return ComplianceRecordStatus::Overdue;
        }

        if ($this->expiry_date !== null && $this->expiry_date->lte($currentDate->copy()->addDays(30))) {
            return ComplianceRecordStatus::ForRenewal;
        }

        if ($this->due_date !== null && $this->due_date->lte($currentDate->copy()->addDays(30))) {
            return ComplianceRecordStatus::DueSoon;
        }

        return $status;
    }

    /**
     * Resolve the next deadline type for the record.
     */
    public function nextDeadlineType(): ?string
    {
        if ($this->due_date === null && $this->expiry_date === null) {
            return null;
        }

        if ($this->due_date !== null && ($this->expiry_date === null || $this->due_date->lte($this->expiry_date))) {
            return 'due';
        }

        return 'expiry';
    }

    /**
     * Resolve the next deadline date for the record.
     */
    public function nextDeadlineDate(): ?CarbonInterface
    {
        return match ($this->nextDeadlineType()) {
            'due' => $this->due_date,
            'expiry' => $this->expiry_date,
            default => null,
        };
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'expiry_date' => 'date',
            'recurrence_unit' => ComplianceRecurrenceUnit::class,
            'reminder_days' => 'array',
            'status' => ComplianceRecordStatus::class,
            'latest_submission_at' => 'date',
        ];
    }
}
