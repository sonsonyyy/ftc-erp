<?php

namespace App\Models;

use App\Enums\TaxCertificateType;
use Database\Factories\TaxCertificateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'certificate_type',
    'certificate_no',
    'certifiable_type',
    'certifiable_id',
    'tax_report_run_id',
    'period_from',
    'period_to',
    'issued_at',
    'gross_amount',
    'tax_amount',
    'payload',
])]
class TaxCertificate extends Model
{
    /** @use HasFactory<TaxCertificateFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'gross_amount' => '0.00',
        'tax_amount' => '0.00',
    ];

    /**
     * Get the entity the certificate belongs to.
     *
     * @return MorphTo<Model, $this>
     */
    public function certifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the report run that produced the certificate.
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
            'certificate_type' => TaxCertificateType::class,
            'period_from' => 'date',
            'period_to' => 'date',
            'issued_at' => 'date',
            'gross_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'payload' => 'array',
        ];
    }
}
