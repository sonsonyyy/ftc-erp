<?php

namespace App\Models;

use App\Enums\PayrollRunStatus;
use Database\Factories\PayrollRunFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'payroll_run_no',
    'period_from',
    'period_to',
    'payroll_date',
    'status',
    'gross_total',
    'total_deductions',
    'net_total',
    'prepared_by_user_id',
    'remarks',
])]
class PayrollRun extends Model
{
    /** @use HasFactory<PayrollRunFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => PayrollRunStatus::Draft->value,
        'gross_total' => '0.00',
        'total_deductions' => '0.00',
        'net_total' => '0.00',
    ];

    /**
     * Get the user who prepared the payroll run.
     *
     * @return BelongsTo<User, $this>
     */
    public function preparedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by_user_id')->withTrashed();
    }

    /**
     * Get payroll entries recorded in this run.
     *
     * @return HasMany<PayrollEntry, $this>
     */
    public function entries(): HasMany
    {
        return $this->hasMany(PayrollEntry::class)->orderBy('id');
    }

    /**
     * Scope a query to search payroll runs.
     *
     * @param  Builder<PayrollRun>  $query
     * @return Builder<PayrollRun>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('payroll_run_no', 'like', "%{$term}%")
                ->orWhere('remarks', 'like', "%{$term}%")
                ->orWhereHas('entries.employee', function (Builder $employeeQuery) use ($term): void {
                    $employeeQuery
                        ->where('employee_no', 'like', "%{$term}%")
                        ->orWhere('first_name', 'like', "%{$term}%")
                        ->orWhere('last_name', 'like', "%{$term}%");
                });
        });
    }

    /**
     * Scope a query to filter by run status.
     *
     * @param  Builder<PayrollRun>  $query
     * @return Builder<PayrollRun>
     */
    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return filled($status)
            ? $query->where('status', $status)
            : $query;
    }

    /**
     * Scope a query to filter by payroll date range.
     *
     * @param  Builder<PayrollRun>  $query
     * @return Builder<PayrollRun>
     */
    public function scopeBetweenPayrollDates(Builder $query, ?string $from, ?string $to): Builder
    {
        if (filled($from)) {
            $query->whereDate('payroll_date', '>=', $from);
        }

        if (filled($to)) {
            $query->whereDate('payroll_date', '<=', $to);
        }

        return $query;
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_from' => 'date',
            'period_to' => 'date',
            'payroll_date' => 'date',
            'status' => PayrollRunStatus::class,
            'gross_total' => 'decimal:2',
            'total_deductions' => 'decimal:2',
            'net_total' => 'decimal:2',
        ];
    }
}
