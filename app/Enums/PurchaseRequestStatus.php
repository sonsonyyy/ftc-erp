<?php

namespace App\Enums;

enum PurchaseRequestStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Ordered = 'ordered';
    case Cancelled = 'cancelled';

    /**
     * Get a human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Submitted => 'Submitted',
            self::Ordered => 'Ordered',
            self::Cancelled => 'Cancelled',
        };
    }
}
