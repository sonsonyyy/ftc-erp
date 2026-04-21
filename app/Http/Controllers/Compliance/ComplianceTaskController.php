<?php

namespace App\Http\Controllers\Compliance;

use App\Enums\ComplianceTaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Compliance\StoreComplianceTaskRequest;
use App\Http\Requests\Compliance\UpdateComplianceTaskRequest;
use App\Models\ComplianceRecord;
use App\Models\ComplianceTask;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ComplianceTaskController extends Controller
{
    /**
     * Store a new task linked to the selected compliance record.
     */
    public function store(
        StoreComplianceTaskRequest $request,
        ComplianceRecord $complianceRecord,
    ): RedirectResponse {
        $this->authorize('update', $complianceRecord);

        $validated = $request->validated();
        $status = isset($validated['status'])
            ? ComplianceTaskStatus::from($validated['status'])
            : ComplianceTaskStatus::Open;

        ComplianceTask::query()->create([
            ...$validated,
            'compliance_record_id' => $complianceRecord->getKey(),
            'status' => $status->value,
            'completed_at' => $status === ComplianceTaskStatus::Completed ? now() : null,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance task added.'),
        ]);

        return back();
    }

    /**
     * Update an existing compliance task.
     */
    public function update(
        UpdateComplianceTaskRequest $request,
        ComplianceRecord $complianceRecord,
        ComplianceTask $task,
    ): RedirectResponse {
        $this->authorize('update', $complianceRecord);

        abort_unless($task->compliance_record_id === $complianceRecord->getKey(), 404);

        $validated = $request->validated();
        $status = ComplianceTaskStatus::from($validated['status']);

        $task->update([
            ...$validated,
            'completed_at' => $status === ComplianceTaskStatus::Completed
                ? ($task->completed_at ?? now())
                : null,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance task updated.'),
        ]);

        return back();
    }

    /**
     * Remove the selected compliance task.
     */
    public function destroy(
        ComplianceRecord $complianceRecord,
        ComplianceTask $task,
    ): RedirectResponse {
        $this->authorize('update', $complianceRecord);

        abort_unless($task->compliance_record_id === $complianceRecord->getKey(), 404);

        $task->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance task removed.'),
        ]);

        return back();
    }
}
