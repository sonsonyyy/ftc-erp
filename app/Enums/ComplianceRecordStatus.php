<?php

namespace App\Enums;

enum ComplianceRecordStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case DueSoon = 'due_soon';
    case ForRenewal = 'for_renewal';
    case ForFiling = 'for_filing';
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Renewed = 'renewed';
    case Expired = 'expired';
    case Overdue = 'overdue';
    case Archived = 'archived';

    /**
     * Get a human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Active => 'Active',
            self::DueSoon => 'Due Soon',
            self::ForRenewal => 'For Renewal',
            self::ForFiling => 'For Filing',
            self::InProgress => 'In Progress',
            self::Submitted => 'Submitted',
            self::Renewed => 'Renewed',
            self::Expired => 'Expired',
            self::Overdue => 'Overdue',
            self::Archived => 'Archived',
        };
    }
}
