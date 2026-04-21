<?php

namespace App\Enums;

use Carbon\CarbonInterface;

enum ComplianceRecurrenceUnit: string
{
    case None = 'none';
    case Monthly = 'monthly';
    case Quarterly = 'quarterly';
    case SemiAnnually = 'semi_annually';
    case Annually = 'annually';

    /**
     * Get a human-readable label for the recurrence unit.
     */
    public function label(): string
    {
        return match ($this) {
            self::None => 'No recurrence',
            self::Monthly => 'Monthly',
            self::Quarterly => 'Quarterly',
            self::SemiAnnually => 'Semi-Annual',
            self::Annually => 'Annual',
        };
    }

    /**
     * Advance a date based on the configured recurrence cadence.
     */
    public function advance(CarbonInterface $date): CarbonInterface
    {
        return match ($this) {
            self::None => $date,
            self::Monthly => $date->copy()->addMonth(),
            self::Quarterly => $date->copy()->addMonths(3),
            self::SemiAnnually => $date->copy()->addMonths(6),
            self::Annually => $date->copy()->addYear(),
        };
    }
}
