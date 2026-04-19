<?php

namespace App\Enums;

enum QuotationStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Awarded = 'awarded';
    case Lost = 'lost';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    /**
     * Get a human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Submitted => 'Submitted',
            self::UnderReview => 'Under Review',
            self::Awarded => 'Awarded',
            self::Lost => 'Lost',
            self::Cancelled => 'Cancelled',
            self::Expired => 'Expired',
        };
    }

    /**
     * Determine if the status requires a lost reason.
     */
    public function requiresLostReason(): bool
    {
        return $this === self::Lost;
    }

    /**
     * Determine if the status should stamp the materialized date.
     */
    public function recordsMaterializedAt(): bool
    {
        return $this === self::Awarded;
    }
}
