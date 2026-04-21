<?php

namespace App\Http\Controllers\Compliance;

use App\Enums\ComplianceRecordStatus;
use App\Http\Controllers\Controller;
use App\Models\ComplianceRecord;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceCalendarController extends Controller
{
    /**
     * Display the compliance deadline calendar view.
     */
    public function __invoke(Request $request): Response
    {
        $this->authorize('viewAny', ComplianceRecord::class);

        $startDate = $request->date('from')
            ? CarbonImmutable::parse((string) $request->input('from'))->startOfDay()
            : CarbonImmutable::today()->startOfMonth();
        $endDate = $request->date('to')
            ? CarbonImmutable::parse((string) $request->input('to'))->endOfDay()
            : CarbonImmutable::today()->endOfMonth();

        if ($startDate->gt($endDate)) {
            [$startDate, $endDate] = [$endDate->startOfDay(), $startDate->endOfDay()];
        }

        $agency = $request->string('agency')->toString();
        $status = $request->string('status')->toString();
        $today = CarbonImmutable::today();

        $baseQuery = ComplianceRecord::query()
            ->with('assignedUser:id,name')
            ->agency($agency)
            ->displayStatus($status, $today);

        $windowRecords = (clone $baseQuery)
            ->withinDeadlineWindow($startDate->toDateString(), $endDate->toDateString())
            ->orderByRaw('COALESCE(due_date, expiry_date) asc nulls last')
            ->orderBy('id')
            ->get();

        $overdueStatuses = $status !== ''
            ? [$status]
            : [ComplianceRecordStatus::Overdue->value, ComplianceRecordStatus::Expired->value];

        $overdueRecords = collect($overdueStatuses)
            ->filter(fn (string $value): bool => in_array($value, [
                ComplianceRecordStatus::Overdue->value,
                ComplianceRecordStatus::Expired->value,
            ], true))
            ->flatMap(fn (string $effectiveStatus) => ComplianceRecord::query()
                ->with('assignedUser:id,name')
                ->agency($agency)
                ->displayStatus($effectiveStatus, $today)
                ->orderByRaw('COALESCE(due_date, expiry_date) asc nulls last')
                ->orderBy('id')
                ->get())
            ->unique(fn (ComplianceRecord $complianceRecord) => $complianceRecord->getKey())
            ->values();

        return Inertia::render('compliance-records/calendar', [
            'filters' => [
                'agency' => $agency,
                'status' => $status,
                'from' => $startDate->toDateString(),
                'to' => $endDate->toDateString(),
            ],
            'window' => [
                'from' => $startDate->toDateString(),
                'to' => $endDate->toDateString(),
            ],
            'summary' => [
                'due_soon_count' => ComplianceRecord::query()
                    ->agency($agency)
                    ->displayStatus(ComplianceRecordStatus::DueSoon->value, $today)
                    ->count(),
                'for_renewal_count' => ComplianceRecord::query()
                    ->agency($agency)
                    ->displayStatus(ComplianceRecordStatus::ForRenewal->value, $today)
                    ->count(),
                'overdue_count' => ComplianceRecord::query()
                    ->agency($agency)
                    ->displayStatus(ComplianceRecordStatus::Overdue->value, $today)
                    ->count(),
                'expired_count' => ComplianceRecord::query()
                    ->agency($agency)
                    ->displayStatus(ComplianceRecordStatus::Expired->value, $today)
                    ->count(),
            ],
            'events' => $windowRecords
                ->flatMap(fn (ComplianceRecord $complianceRecord) => $this->eventItems(
                    $complianceRecord,
                    $startDate,
                    $endDate,
                ))
                ->sortBy([
                    ['date', 'asc'],
                    ['record_no', 'asc'],
                ])
                ->values()
                ->all(),
            'overdueItems' => $overdueRecords
                ->map(fn (ComplianceRecord $complianceRecord) => $this->recordSnapshot($complianceRecord))
                ->all(),
            'statusOptions' => collect(ComplianceRecordStatus::cases())
                ->map(fn (ComplianceRecordStatus $recordStatus) => [
                    'value' => $recordStatus->value,
                    'label' => $recordStatus->label(),
                ])->all(),
            'agencyOptions' => $this->agencyOptions(),
        ]);
    }

    /**
     * Build event entries for due and expiry dates within the selected window.
     *
     * @return array<int, array<string, mixed>>
     */
    private function eventItems(
        ComplianceRecord $complianceRecord,
        CarbonImmutable $startDate,
        CarbonImmutable $endDate,
    ): array {
        $events = [];

        if (
            $complianceRecord->due_date !== null
            && $complianceRecord->due_date->betweenIncluded($startDate, $endDate)
        ) {
            $events[] = [
                ...$this->recordSnapshot($complianceRecord),
                'date' => $complianceRecord->due_date->toDateString(),
                'deadline_type' => 'due',
                'deadline_type_label' => 'Due date',
            ];
        }

        if (
            $complianceRecord->expiry_date !== null
            && $complianceRecord->expiry_date->betweenIncluded($startDate, $endDate)
        ) {
            $events[] = [
                ...$this->recordSnapshot($complianceRecord),
                'date' => $complianceRecord->expiry_date->toDateString(),
                'deadline_type' => 'expiry',
                'deadline_type_label' => 'Expiry date',
            ];
        }

        return $events;
    }

    /**
     * Transform a record into a compact calendar payload.
     *
     * @return array<string, mixed>
     */
    private function recordSnapshot(ComplianceRecord $complianceRecord): array
    {
        $displayStatus = $complianceRecord->displayStatus();

        return [
            'id' => $complianceRecord->getKey(),
            'record_no' => $complianceRecord->record_no,
            'title' => $complianceRecord->title,
            'agency' => $complianceRecord->agency,
            'category' => $complianceRecord->category,
            'due_date' => optional($complianceRecord->due_date)?->toDateString(),
            'expiry_date' => optional($complianceRecord->expiry_date)?->toDateString(),
            'display_status' => $displayStatus->value,
            'display_status_label' => $displayStatus->label(),
            'assigned_user' => $complianceRecord->assignedUser?->name,
        ];
    }

    /**
     * Build agency filter options for compliance calendar views.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function agencyOptions(): array
    {
        return ComplianceRecord::query()
            ->select('agency')
            ->distinct()
            ->orderBy('agency')
            ->pluck('agency')
            ->filter()
            ->values()
            ->map(fn (string $agency) => [
                'value' => $agency,
                'label' => $agency,
            ])->all();
    }
}
