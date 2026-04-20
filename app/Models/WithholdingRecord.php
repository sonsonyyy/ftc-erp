<?php

namespace App\Models;

use App\Enums\WithholdingRecordType;
use Database\Factories\WithholdingRecordFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'record_type',
    'source_type',
    'source_id',
    'record_date',
    'reference_no',
    'subject_name',
    'subject_tin',
    'subject_identifier',
    'base_amount',
    'amount',
    'metadata',
])]
class WithholdingRecord extends Model
{
    /** @use HasFactory<WithholdingRecordFactory> */
    use HasFactory;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'base_amount' => '0.00',
        'amount' => '0.00',
    ];

    /**
     * Scope a query to search withholding records.
     *
     * @param  Builder<WithholdingRecord>  $query
     * @return Builder<WithholdingRecord>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('reference_no', 'like', "%{$term}%")
                ->orWhere('subject_name', 'like', "%{$term}%")
                ->orWhere('subject_tin', 'like', "%{$term}%")
                ->orWhere('subject_identifier', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by record type.
     *
     * @param  Builder<WithholdingRecord>  $query
     * @return Builder<WithholdingRecord>
     */
    public function scopeType(Builder $query, ?string $recordType): Builder
    {
        return filled($recordType)
            ? $query->where('record_type', $recordType)
            : $query;
    }

    /**
     * Scope a query to filter by record date range.
     *
     * @param  Builder<WithholdingRecord>  $query
     * @return Builder<WithholdingRecord>
     */
    public function scopeBetweenRecordDates(Builder $query, ?string $from, ?string $to): Builder
    {
        if (filled($from)) {
            $query->whereDate('record_date', '>=', $from);
        }

        if (filled($to)) {
            $query->whereDate('record_date', '<=', $to);
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
            'record_type' => WithholdingRecordType::class,
            'record_date' => 'date',
            'base_amount' => 'decimal:2',
            'amount' => 'decimal:2',
            'metadata' => 'array',
        ];
    }
}
