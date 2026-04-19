<?php

namespace App\Enums;

enum WorkOrderStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case InProgress = 'in_progress';
    case ForReview = 'for_review';
    case Completed = 'completed';
    case Closed = 'closed';
    case Cancelled = 'cancelled';

    /**
     * Get a human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Scheduled => 'Scheduled',
            self::InProgress => 'In Progress',
            self::ForReview => 'For Review',
            self::Completed => 'Completed',
            self::Closed => 'Closed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Determine if the status should stamp the completion date.
     */
    public function recordsCompletionDate(): bool
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
            self::Draft => [self::Scheduled, self::InProgress, self::Cancelled],
            self::Scheduled => [self::InProgress, self::Cancelled],
            self::InProgress => [self::ForReview, self::Completed, self::Cancelled],
            self::ForReview => [self::InProgress, self::Completed, self::Cancelled],
            self::Completed => [self::Closed],
            self::Closed, self::Cancelled => [],
        };
    }
}
