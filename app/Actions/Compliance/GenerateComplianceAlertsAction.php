<?php

namespace App\Actions\Compliance;

use App\Enums\ComplianceAlertType;
use App\Enums\ComplianceRecordStatus;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Schema;

class GenerateComplianceAlertsAction
{
    /**
     * Generate reminder and overdue alerts for active compliance records.
     */
    public function handle(?CarbonInterface $runDate = null): int
    {
        if (! $this->complianceModuleReady()) {
            return 0;
        }

        $today = $runDate instanceof CarbonInterface
            ? CarbonImmutable::parse($runDate->toDateString())
            : CarbonImmutable::today();

        $createdCount = 0;

        ComplianceRecord::query()
            ->where('status', '!=', ComplianceRecordStatus::Archived->value)
            ->with('complianceTemplate:id,default_reminder_days')
            ->get()
            ->each(function (ComplianceRecord $complianceRecord) use (&$createdCount, $today): void {
                $createdCount += $this->alertsForDeadline(
                    $complianceRecord,
                    $today,
                    'due',
                    $complianceRecord->due_date,
                );
                $createdCount += $this->alertsForDeadline(
                    $complianceRecord,
                    $today,
                    'expiry',
                    $complianceRecord->expiry_date,
                );
            });

        return $createdCount;
    }

    /**
     * Determine if the compliance tables are available.
     */
    private function complianceModuleReady(): bool
    {
        return Schema::hasTable('compliance_records')
            && Schema::hasTable('compliance_alerts');
    }

    /**
     * Generate alerts for a specific deadline on a record.
     */
    private function alertsForDeadline(
        ComplianceRecord $complianceRecord,
        CarbonImmutable $today,
        string $deadlineType,
        ?CarbonInterface $referenceDate,
    ): int {
        if (! $referenceDate instanceof CarbonInterface) {
            return 0;
        }

        $normalizedReferenceDate = CarbonImmutable::parse($referenceDate->toDateString());
        $createdCount = 0;

        foreach ($complianceRecord->resolvedReminderDays() as $daysBefore) {
            if (! $normalizedReferenceDate->subDays($daysBefore)->isSameDay($today)) {
                continue;
            }

            $alertType = $deadlineType === 'due'
                ? ComplianceAlertType::DueReminder
                : ComplianceAlertType::ExpiryReminder;

            if ($this->firstOrCreateAlert(
                $complianceRecord,
                $alertType,
                $deadlineType,
                $today,
                $normalizedReferenceDate,
                $daysBefore,
                $this->reminderMessage($complianceRecord, $deadlineType, $normalizedReferenceDate, $daysBefore),
            )) {
                $createdCount++;
            }
        }

        if ($normalizedReferenceDate->lt($today)) {
            $alertType = $deadlineType === 'due'
                ? ComplianceAlertType::DueOverdue
                : ComplianceAlertType::ExpiryExpired;

            if ($this->firstOrCreateAlert(
                $complianceRecord,
                $alertType,
                $deadlineType,
                $today,
                $normalizedReferenceDate,
                0,
                $this->overdueMessage($complianceRecord, $deadlineType, $normalizedReferenceDate),
            )) {
                $createdCount++;
            }
        }

        return $createdCount;
    }

    /**
     * Persist a compliance alert if the same alert has not been generated yet.
     */
    private function firstOrCreateAlert(
        ComplianceRecord $complianceRecord,
        ComplianceAlertType $alertType,
        string $deadlineType,
        CarbonImmutable $scheduledFor,
        CarbonImmutable $referenceDate,
        int $daysBefore,
        string $message,
    ): bool {
        $alert = ComplianceAlert::query()->firstOrCreate(
            [
                'compliance_record_id' => $complianceRecord->getKey(),
                'alert_type' => $alertType->value,
                'deadline_type' => $deadlineType,
                'scheduled_for' => $scheduledFor->toDateString(),
                'reference_date' => $referenceDate->toDateString(),
                'days_before' => $daysBefore,
            ],
            [
                'message' => $message,
            ],
        );

        return $alert->wasRecentlyCreated;
    }

    /**
     * Build a due or expiry reminder message.
     */
    private function reminderMessage(
        ComplianceRecord $complianceRecord,
        string $deadlineType,
        CarbonImmutable $referenceDate,
        int $daysBefore,
    ): string {
        $deadlineLabel = $deadlineType === 'due' ? 'due' : 'expiry';

        return "{$complianceRecord->record_no} is {$deadlineLabel} in {$daysBefore} day(s) on {$referenceDate->toFormattedDateString()}.";
    }

    /**
     * Build an overdue or expired reminder message.
     */
    private function overdueMessage(
        ComplianceRecord $complianceRecord,
        string $deadlineType,
        CarbonImmutable $referenceDate,
    ): string {
        $deadlineLabel = $deadlineType === 'due' ? 'overdue' : 'expired';

        return "{$complianceRecord->record_no} is {$deadlineLabel} since {$referenceDate->toFormattedDateString()}.";
    }
}
