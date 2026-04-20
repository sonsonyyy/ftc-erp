<?php

namespace App\Enums;

enum EmploymentStatus: string
{
    case Regular = 'regular';
    case Probationary = 'probationary';
    case Contractual = 'contractual';
    case ProjectBased = 'project_based';
    case PartTime = 'part_time';

    /**
     * Get a human-readable label for the employment status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Regular => 'Regular',
            self::Probationary => 'Probationary',
            self::Contractual => 'Contractual',
            self::ProjectBased => 'Project Based',
            self::PartTime => 'Part Time',
        };
    }
}
