<?php

namespace App\Enums;

enum ComplianceTaskStatus: string
{
    case Open = 'open';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Get a human-readable label for the task status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Open => 'Open',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }
}
