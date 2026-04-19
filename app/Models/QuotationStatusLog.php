<?php

namespace App\Models;

use App\Enums\QuotationStatus;
use Database\Factories\QuotationStatusLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quotation_id',
    'from_status',
    'to_status',
    'changed_by',
    'remarks',
    'changed_at',
])]
class QuotationStatusLog extends Model
{
    /** @use HasFactory<QuotationStatusLogFactory> */
    use HasFactory;

    /**
     * Disable default timestamps because the log uses changed_at.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the quotation that owns the status log.
     *
     * @return BelongsTo<Quotation, $this>
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Get the user who changed the quotation status.
     *
     * @return BelongsTo<User, $this>
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'from_status' => QuotationStatus::class,
            'to_status' => QuotationStatus::class,
            'changed_at' => 'datetime',
        ];
    }
}
