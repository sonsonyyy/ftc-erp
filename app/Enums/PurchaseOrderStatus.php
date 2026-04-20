<?php

namespace App\Enums;

enum PurchaseOrderStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Approved = 'approved';
    case PartiallyReceived = 'partially_received';
    case FullyReceived = 'fully_received';
    case Cancelled = 'cancelled';

    /**
     * Get a human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Submitted => 'Submitted',
            self::Approved => 'Approved',
            self::PartiallyReceived => 'Partially Received',
            self::FullyReceived => 'Fully Received',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Determine if the purchase order may accept receipts.
     */
    public function allowsReceiving(): bool
    {
        return in_array($this, [
            self::Approved,
            self::PartiallyReceived,
        ], true);
    }
}
