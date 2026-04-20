<?php

namespace App\Models;

use Database\Factories\PayrollDeductionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['payroll_entry_id', 'deduction_name', 'amount', 'remarks'])]
class PayrollDeduction extends Model
{
    /** @use HasFactory<PayrollDeductionFactory> */
    use HasFactory;

    /**
     * Get the payroll entry that owns this deduction.
     *
     * @return BelongsTo<PayrollEntry, $this>
     */
    public function payrollEntry(): BelongsTo
    {
        return $this->belongsTo(PayrollEntry::class);
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
