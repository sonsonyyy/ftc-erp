<?php

namespace App\Models;

use App\Enums\TaxReportType;
use Database\Factories\TaxReportRunFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'report_no',
    'report_type',
    'period_from',
    'period_to',
    'generated_by_user_id',
    'generated_at',
    'item_count',
    'base_amount_total',
    'amount_total',
    'vat_amount_total',
    'gross_amount_total',
    'remarks',
])]
class TaxReportRun extends Model
{
    /** @use HasFactory<TaxReportRunFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'item_count' => 0,
        'base_amount_total' => '0.00',
        'amount_total' => '0.00',
        'vat_amount_total' => '0.00',
        'gross_amount_total' => '0.00',
    ];

    /**
     * Get the user who generated the report run.
     *
     * @return BelongsTo<User, $this>
     */
    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_user_id')->withTrashed();
    }

    /**
     * Get the snapshot line items for the report run.
     *
     * @return HasMany<TaxReportItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(TaxReportItem::class)
            ->orderBy('record_date')
            ->orderBy('id');
    }

    /**
     * Scope a query to search report runs.
     *
     * @param  Builder<TaxReportRun>  $query
     * @return Builder<TaxReportRun>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('report_no', 'like', "%{$term}%")
                ->orWhere('remarks', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by report type.
     *
     * @param  Builder<TaxReportRun>  $query
     * @return Builder<TaxReportRun>
     */
    public function scopeType(Builder $query, ?string $reportType): Builder
    {
        return filled($reportType)
            ? $query->where('report_type', $reportType)
            : $query;
    }

    /**
     * Scope a query to filter by overlapping periods.
     *
     * @param  Builder<TaxReportRun>  $query
     * @return Builder<TaxReportRun>
     */
    public function scopeBetweenPeriods(Builder $query, ?string $from, ?string $to): Builder
    {
        if (filled($from)) {
            $query->whereDate('period_to', '>=', $from);
        }

        if (filled($to)) {
            $query->whereDate('period_from', '<=', $to);
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
            'report_type' => TaxReportType::class,
            'period_from' => 'date',
            'period_to' => 'date',
            'generated_at' => 'datetime',
            'base_amount_total' => 'decimal:2',
            'amount_total' => 'decimal:2',
            'vat_amount_total' => 'decimal:2',
            'gross_amount_total' => 'decimal:2',
        ];
    }
}
