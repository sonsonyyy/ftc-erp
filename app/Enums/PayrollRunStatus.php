<?php

namespace App\Enums;

enum PayrollRunStatus: string
{
    case Draft = 'draft';
    case Processed = 'processed';
    case Cancelled = 'cancelled';

    /**
     * Get a human-readable label for the payroll run status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Processed => 'Processed',
            self::Cancelled => 'Cancelled',
        };
    }
}
