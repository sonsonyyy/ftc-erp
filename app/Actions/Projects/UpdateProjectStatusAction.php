<?php

namespace App\Actions\Projects;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectStatusLog;
use App\Models\User;
use Illuminate\Support\Carbon;

class UpdateProjectStatusAction
{
    /**
     * Record the initial status entry for a project.
     */
    public function recordInitialStatus(Project $project, User $changedBy): void
    {
        ProjectStatusLog::query()->create([
            'project_id' => $project->getKey(),
            'from_status' => null,
            'to_status' => $project->status,
            'changed_by' => $changedBy->getKey(),
            'remarks' => 'Project record created.',
            'changed_at' => now(),
        ]);
    }

    /**
     * Update a project status and record the transition.
     */
    public function handle(
        Project $project,
        ProjectStatus $status,
        User $changedBy,
        ?string $remarks = null,
        ?string $actualEndDate = null,
    ): Project {
        $fromStatus = $project->status;
        $resolvedActualEndDate = $project->actual_end_date;

        if ($status->recordsActualEndDate()) {
            $resolvedActualEndDate = filled($actualEndDate)
                ? Carbon::parse($actualEndDate)
                : ($project->actual_end_date ?? now());
        }

        $project->update([
            'status' => $status,
            'actual_end_date' => $resolvedActualEndDate,
        ]);

        ProjectStatusLog::query()->create([
            'project_id' => $project->getKey(),
            'from_status' => $fromStatus,
            'to_status' => $status,
            'changed_by' => $changedBy->getKey(),
            'remarks' => $remarks,
            'changed_at' => now(),
        ]);

        return $project->refresh();
    }
}
