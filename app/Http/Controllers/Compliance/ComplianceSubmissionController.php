<?php

namespace App\Http\Controllers\Compliance;

use App\Enums\ComplianceRecordStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Compliance\StoreComplianceSubmissionRequest;
use App\Models\ComplianceRecord;
use App\Models\ComplianceSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ComplianceSubmissionController extends Controller
{
    /**
     * Store a submission or renewal history entry for the record.
     */
    public function store(
        StoreComplianceSubmissionRequest $request,
        ComplianceRecord $complianceRecord,
    ): RedirectResponse {
        $this->authorize('update', $complianceRecord);

        DB::transaction(function () use ($request, $complianceRecord): void {
            $validated = $request->validated();

            ComplianceSubmission::query()->create([
                ...$validated,
                'compliance_record_id' => $complianceRecord->getKey(),
                'submitted_by_user_id' => $request->user()?->getKey(),
                'due_date_snapshot' => $complianceRecord->due_date,
                'expiry_date_snapshot' => $complianceRecord->expiry_date,
            ]);

            $hasNextDeadline = filled($validated['next_due_date'] ?? null)
                || filled($validated['next_expiry_date'] ?? null);

            $complianceRecord->update([
                'due_date' => $validated['next_due_date'] ?? $complianceRecord->due_date,
                'expiry_date' => $validated['next_expiry_date'] ?? $complianceRecord->expiry_date,
                'latest_submission_at' => $validated['submitted_at'],
                'latest_submission_reference' => $validated['reference_no'],
                'status' => $hasNextDeadline
                    ? ComplianceRecordStatus::Renewed->value
                    : ComplianceRecordStatus::Submitted->value,
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance submission recorded.'),
        ]);

        return back();
    }
}
