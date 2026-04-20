<?php

namespace App\Models;

use Database\Factories\PayrollEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'payroll_run_id',
    'employee_id',
    'gross_pay',
    'tax_amount',
    'sss_amount',
    'pagibig_amount',
    'philhealth_amount',
    'other_deductions_amount',
    'total_deductions',
    'net_pay',
    'remarks',
])]
class PayrollEntry extends Model
{
    /** @use HasFactory<PayrollEntryFactory> */
    use HasFactory;

    /**
     * Get the payroll run that owns this entry.
     *
     * @return BelongsTo<PayrollRun, $this>
     */
    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    /**
     * Get the employee included in this payroll entry.
     *
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    /**
     * Get additional deductions linked to the entry.
     *
     * @return HasMany<PayrollDeduction, $this>
     */
    public function deductions(): HasMany
    {
        return $this->hasMany(PayrollDeduction::class)->orderBy('id');
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gross_pay' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'sss_amount' => 'decimal:2',
            'pagibig_amount' => 'decimal:2',
            'philhealth_amount' => 'decimal:2',
            'other_deductions_amount' => 'decimal:2',
            'total_deductions' => 'decimal:2',
            'net_pay' => 'decimal:2',
        ];
    }
}
