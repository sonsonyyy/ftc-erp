<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case PartiallyPaid = 'partially_paid';
    case Paid = 'paid';
    case Overdue = 'overdue';
    case Cancelled = 'cancelled';

    /**
     * Get a human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Issued => 'Issued',
            self::PartiallyPaid => 'Partially Paid',
            self::Paid => 'Paid',
            self::Overdue => 'Overdue',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Determine whether the status may be chosen manually on invoice forms.
     */
    public function isManualSelection(): bool
    {
        return in_array($this, [
            self::Draft,
            self::Issued,
            self::Cancelled,
        ], true);
    }

    /**
     * Determine whether payments may be posted while this status is active.
     */
    public function allowsPayments(): bool
    {
        return in_array($this, [
            self::Issued,
            self::PartiallyPaid,
            self::Overdue,
        ], true);
    }
}
