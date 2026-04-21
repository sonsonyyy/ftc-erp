<?php

namespace App\Enums;

enum ComplianceAlertType: string
{
    case DueReminder = 'due_reminder';
    case ExpiryReminder = 'expiry_reminder';
    case DueOverdue = 'due_overdue';
    case ExpiryExpired = 'expiry_expired';

    /**
     * Get a human-readable label for the alert type.
     */
    public function label(): string
    {
        return match ($this) {
            self::DueReminder => 'Due Reminder',
            self::ExpiryReminder => 'Expiry Reminder',
            self::DueOverdue => 'Overdue Reminder',
            self::ExpiryExpired => 'Expired Reminder',
        };
    }

    /**
     * Get the deadline type that this alert watches.
     */
    public function deadlineType(): string
    {
        return match ($this) {
            self::DueReminder,
            self::DueOverdue => 'due',
            self::ExpiryReminder,
            self::ExpiryExpired => 'expiry',
        };
    }
}
