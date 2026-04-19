<?php

namespace App\Actions\Quotations;

use App\Enums\QuotationStatus;
use App\Models\Quotation;
use App\Models\QuotationStatusLog;
use App\Models\User;
use Illuminate\Support\Carbon;

class UpdateQuotationStatusAction
{
    /**
     * Record the initial status entry for a quotation.
     */
    public function recordInitialStatus(Quotation $quotation, User $changedBy): void
    {
        QuotationStatusLog::query()->create([
            'quotation_id' => $quotation->getKey(),
            'from_status' => null,
            'to_status' => $quotation->status,
            'changed_by' => $changedBy->getKey(),
            'remarks' => 'Quotation record created.',
            'changed_at' => now(),
        ]);
    }

    /**
     * Update a quotation status and record the transition.
     */
    public function handle(
        Quotation $quotation,
        QuotationStatus $status,
        User $changedBy,
        ?string $remarks = null,
        ?string $lostReason = null,
        ?string $materializedAt = null,
    ): Quotation {
        $fromStatus = $quotation->status;
        $resolvedMaterializedAt = $quotation->materialized_at;

        if ($status->recordsMaterializedAt()) {
            $resolvedMaterializedAt = filled($materializedAt)
                ? Carbon::parse($materializedAt)
                : ($quotation->materialized_at ?? now());
        }

        $quotation->update([
            'status' => $status,
            'lost_reason' => $status->requiresLostReason() ? $lostReason : null,
            'materialized_at' => $resolvedMaterializedAt,
        ]);

        QuotationStatusLog::query()->create([
            'quotation_id' => $quotation->getKey(),
            'from_status' => $fromStatus,
            'to_status' => $status,
            'changed_by' => $changedBy->getKey(),
            'remarks' => $remarks,
            'changed_at' => now(),
        ]);

        return $quotation->refresh();
    }
}
