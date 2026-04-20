<?php

namespace App\Models;

use Database\Factories\TaxReportItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tax_report_run_id',
    'source_record_type',
    'source_record_id',
    'line_type',
    'record_date',
    'reference_no',
    'subject_name',
    'subject_tin',
    'base_amount',
    'amount',
    'vat_amount',
    'gross_amount',
    'payload',
])]
class TaxReportItem extends Model
{
    /** @use HasFactory<TaxReportItemFactory> */
    use HasFactory;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'base_amount' => '0.00',
        'amount' => '0.00',
        'vat_amount' => '0.00',
        'gross_amount' => '0.00',
    ];

    /**
     * Get the report run that owns the item.
     *
     * @return BelongsTo<TaxReportRun, $this>
     */
    public function taxReportRun(): BelongsTo
    {
        return $this->belongsTo(TaxReportRun::class);
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'record_date' => 'date',
            'base_amount' => 'decimal:2',
            'amount' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'gross_amount' => 'decimal:2',
            'payload' => 'array',
        ];
    }
}
