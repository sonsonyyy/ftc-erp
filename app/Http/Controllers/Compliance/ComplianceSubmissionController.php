<?php

namespace App\Http\Controllers\Compliance;

use App\Enums\ComplianceRecordStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Compliance\ReviewComplianceSubmissionRequest;
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

            $complianceRecord->update([
                'latest_submission_at' => $validated['submitted_at'],
                'latest_submission_reference' => $validated['reference_no'],
                'status' => ComplianceRecordStatus::Submitted->value,
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance submission recorded.'),
        ]);

        return back();
    }

    /**
     * Approve a recorded submission and apply its next-cycle dates.
     */
    public function approve(
        ReviewComplianceSubmissionRequest $request,
        ComplianceRecord $complianceRecord,
        ComplianceSubmission $submission,
    ): RedirectResponse {
        abort_unless($submission->compliance_record_id === $complianceRecord->getKey(), 404);

        $this->authorize('approveSubmission', $complianceRecord);
        abort_if($submission->approved_at !== null, 403);

        DB::transaction(function () use ($request, $complianceRecord, $submission): void {
            $submission->update([
                'approved_at' => now(),
                'approved_by_user_id' => $request->user()?->getKey(),
                'approval_notes' => $request->validated('approval_notes'),
            ]);

            $hasNextDeadline = filled($submission->next_due_date) || filled($submission->next_expiry_date);

            $complianceRecord->update([
                'due_date' => $submission->next_due_date ?? $complianceRecord->due_date,
                'expiry_date' => $submission->next_expiry_date ?? $complianceRecord->expiry_date,
                'latest_submission_at' => $submission->submitted_at,
                'latest_submission_reference' => $submission->reference_no,
                'status' => $hasNextDeadline
                    ? ComplianceRecordStatus::Renewed->value
                    : ComplianceRecordStatus::Submitted->value,
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance submission approved.'),
        ]);

        return back();
    }
}
