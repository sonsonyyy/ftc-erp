<?php

namespace App\Actions\WorkOrders;

use App\Enums\WorkOrderLogType;
use App\Enums\WorkOrderStatus;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderLog;
use Illuminate\Support\Carbon;

class UpdateWorkOrderStatusAction
{
    /**
     * Record the initial work order status entry.
     */
    public function recordInitialLog(WorkOrder $workOrder, User $loggedBy): void
    {
        WorkOrderLog::query()->create([
            'work_order_id' => $workOrder->getKey(),
            'log_type' => WorkOrderLogType::StatusChange,
            'from_status' => null,
            'to_status' => $workOrder->status,
            'details' => 'Work order record created.',
            'logged_by' => $loggedBy->getKey(),
            'logged_at' => now(),
        ]);
    }

    /**
     * Update a work order status and record the transition.
     */
    public function handle(
        WorkOrder $workOrder,
        WorkOrderStatus $status,
        User $loggedBy,
        ?string $details = null,
        ?string $completionDate = null,
    ): WorkOrder {
        $fromStatus = $workOrder->status;
        $resolvedCompletionDate = $workOrder->completion_date;

        if ($status->recordsCompletionDate()) {
            $resolvedCompletionDate = filled($completionDate)
                ? Carbon::parse($completionDate)
                : ($workOrder->completion_date ?? now());
        }

        $workOrder->update([
            'status' => $status,
            'completion_date' => $resolvedCompletionDate,
        ]);

        WorkOrderLog::query()->create([
            'work_order_id' => $workOrder->getKey(),
            'log_type' => WorkOrderLogType::StatusChange,
            'from_status' => $fromStatus,
            'to_status' => $status,
            'details' => $details,
            'logged_by' => $loggedBy->getKey(),
            'logged_at' => now(),
        ]);

        return $workOrder->refresh();
    }
}
