<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case InProgress = 'in_progress';
    case OnHold = 'on_hold';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Get a human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Open => 'Open',
            self::InProgress => 'In Progress',
            self::OnHold => 'On Hold',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Determine if the status should stamp the actual end date.
     */
    public function recordsActualEndDate(): bool
    {
        return $this === self::Completed;
    }

    /**
     * Determine if the status can transition to the given next status.
     */
    public function canTransitionTo(self $nextStatus): bool
    {
        return in_array($nextStatus, $this->allowedTransitions(), true);
    }

    /**
     * Get the allowed next statuses for the current status.
     *
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Open, self::Cancelled],
            self::Open => [self::InProgress, self::OnHold, self::Completed, self::Cancelled],
            self::InProgress => [self::OnHold, self::Completed, self::Cancelled],
            self::OnHold => [self::Open, self::InProgress, self::Cancelled],
            self::Completed, self::Cancelled => [],
        };
    }
}
