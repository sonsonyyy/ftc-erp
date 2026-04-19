<?php

namespace App\Enums;

enum WorkOrderLogType: string
{
    case Note = 'note';
    case StatusChange = 'status_change';

    /**
     * Get a human readable label for the log type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Note => 'Note',
            self::StatusChange => 'Status change',
        };
    }
}
