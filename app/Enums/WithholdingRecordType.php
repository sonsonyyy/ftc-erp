<?php

namespace App\Enums;

enum WithholdingRecordType: string
{
    case CompensationWithholding = 'compensation_withholding';
    case ExpandedWithholding = 'expanded_withholding';
    case SssContribution = 'sss_contribution';
    case PagibigContribution = 'pagibig_contribution';
    case PhilhealthContribution = 'philhealth_contribution';

    /**
     * Get a human-readable label for the record type.
     */
    public function label(): string
    {
        return match ($this) {
            self::CompensationWithholding => 'Compensation Withholding',
            self::ExpandedWithholding => 'Expanded Withholding',
            self::SssContribution => 'SSS Contribution',
            self::PagibigContribution => 'Pag-IBIG Contribution',
            self::PhilhealthContribution => 'PhilHealth Contribution',
        };
    }

    /**
     * Determine whether this record is a contribution item.
     */
    public function isContribution(): bool
    {
        return match ($this) {
            self::SssContribution,
            self::PagibigContribution,
            self::PhilhealthContribution => true,
            self::CompensationWithholding,
            self::ExpandedWithholding => false,
        };
    }
}
