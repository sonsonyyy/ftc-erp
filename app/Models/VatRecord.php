<?php

namespace App\Models;

use App\Enums\VatRecordType;
use Database\Factories\VatRecordFactory;
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
    'counterparty_name',
    'counterparty_tin',
    'net_amount',
    'vat_amount',
    'gross_amount',
    'metadata',
])]
class VatRecord extends Model
{
    /** @use HasFactory<VatRecordFactory> */
    use HasFactory;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'net_amount' => '0.00',
        'vat_amount' => '0.00',
        'gross_amount' => '0.00',
    ];

    /**
     * Scope a query to search VAT records.
     *
     * @param  Builder<VatRecord>  $query
     * @return Builder<VatRecord>
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
                ->orWhere('counterparty_name', 'like', "%{$term}%")
                ->orWhere('counterparty_tin', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by VAT record type.
     *
     * @param  Builder<VatRecord>  $query
     * @return Builder<VatRecord>
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
     * @param  Builder<VatRecord>  $query
     * @return Builder<VatRecord>
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
            'record_type' => VatRecordType::class,
            'record_date' => 'date',
            'net_amount' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'gross_amount' => 'decimal:2',
            'metadata' => 'array',
        ];
    }
}
