<?php

namespace App\Http\Controllers\Compliance;

use App\Enums\ComplianceAlertType;
use App\Http\Controllers\Controller;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplianceAlertController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of compliance alerts.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ComplianceAlert::class);

        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();
        $acknowledged = $request->string('acknowledged')->toString();
        $agency = $request->string('agency')->toString();
        $perPage = $this->resolvePerPage($request);
        $operator = ComplianceAlert::query()->getConnection()->getDriverName() === 'pgsql'
            ? 'ilike'
            : 'like';

        $alerts = ComplianceAlert::query()
            ->with([
                'acknowledgedBy:id,name',
                'complianceRecord:id,record_no,title,agency',
            ])
            ->when($search !== '', function ($query) use ($search, $operator): void {
                $query->where(function ($builder) use ($search, $operator): void {
                    $builder
                        ->where('message', $operator, "%{$search}%")
                        ->orWhereHas('complianceRecord', function ($recordQuery) use ($search, $operator): void {
                            $recordQuery
                                ->where('record_no', $operator, "%{$search}%")
                                ->orWhere('title', $operator, "%{$search}%");
                        });
                });
            })
            ->type($type)
            ->acknowledged($acknowledged)
            ->when($agency !== '', function ($query) use ($agency): void {
                $query->whereHas('complianceRecord', function ($recordQuery) use ($agency): void {
                    $recordQuery->where('agency', $agency);
                });
            })
            ->orderByRaw('acknowledged_at is not null')
            ->orderBy('scheduled_for')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (ComplianceAlert $alert) => $this->alertListItem($request, $alert));

        return Inertia::render('compliance-alerts/index', [
            'alerts' => $alerts,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'acknowledged' => $acknowledged,
                'agency' => $agency,
                'per_page' => $perPage,
            ],
            'typeOptions' => collect(ComplianceAlertType::cases())
                ->map(fn (ComplianceAlertType $alertType) => [
                    'value' => $alertType->value,
                    'label' => $alertType->label(),
                ])->all(),
            'acknowledgementOptions' => [
                ['value' => 'unacknowledged', 'label' => 'Unacknowledged'],
                ['value' => 'acknowledged', 'label' => 'Acknowledged'],
            ],
            'agencyOptions' => $this->agencyOptions(),
        ]);
    }

    /**
     * Acknowledge the selected compliance alert.
     */
    public function acknowledge(Request $request, ComplianceAlert $complianceAlert): RedirectResponse
    {
        $this->authorize('update', $complianceAlert);

        if ($complianceAlert->acknowledged_at === null) {
            $complianceAlert->update([
                'acknowledged_at' => now(),
                'acknowledged_by_user_id' => $request->user()?->getKey(),
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Compliance alert acknowledged.'),
        ]);

        return back();
    }

    /**
     * Transform an alert into an index-row payload.
     *
     * @return array<string, mixed>
     */
    private function alertListItem(Request $request, ComplianceAlert $alert): array
    {
        return [
            'id' => $alert->getKey(),
            'alert_type' => $alert->alert_type->value,
            'alert_type_label' => $alert->alert_type->label(),
            'deadline_type' => $alert->deadline_type,
            'scheduled_for' => optional($alert->scheduled_for)?->toDateString(),
            'reference_date' => optional($alert->reference_date)?->toDateString(),
            'days_before' => (int) $alert->days_before,
            'message' => $alert->message,
            'acknowledged_at' => optional($alert->acknowledged_at)?->toIso8601String(),
            'acknowledged_by' => $alert->acknowledgedBy?->name,
            'record' => $alert->complianceRecord === null ? null : [
                'id' => $alert->complianceRecord->getKey(),
                'record_no' => $alert->complianceRecord->record_no,
                'title' => $alert->complianceRecord->title,
                'agency' => $alert->complianceRecord->agency,
            ],
            'can' => [
                'acknowledge' => ($request->user()?->can('update', $alert) ?? false)
                    && $alert->acknowledged_at === null,
            ],
        ];
    }

    /**
     * Build agency filter options for compliance views.
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

    /**
     * Resolve the validated page size for the compliance alerts table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
