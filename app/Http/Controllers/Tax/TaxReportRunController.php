<?php

namespace App\Http\Controllers\Tax;

use App\Actions\Tax\GenerateTaxReportRunAction;
use App\Enums\TaxReportType;
use App\Enums\VatRecordType;
use App\Enums\WithholdingRecordType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tax\StoreTaxReportRunRequest;
use App\Models\TaxReportItem;
use App\Models\TaxReportRun;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TaxReportRunController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', TaxReportRun::class);

        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());
        $perPage = $this->resolvePerPage($request);

        $taxReportRuns = TaxReportRun::query()
            ->with('generatedBy:id,name')
            ->search($search)
            ->type($type)
            ->betweenPeriods($from, $to)
            ->orderByDesc('generated_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (TaxReportRun $taxReportRun) => $this->reportRunListItem($request, $taxReportRun));

        return Inertia::render('tax-report-runs/index', [
            'taxReportRuns' => $taxReportRuns,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'from' => $from,
                'to' => $to,
                'per_page' => $perPage,
            ],
            'reportTypeOptions' => $this->reportTypeOptions(),
            'can' => [
                'create' => $request->user()?->can('create', TaxReportRun::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', TaxReportRun::class);

        return Inertia::render('tax-report-runs/create', [
            'reportTypeOptions' => $this->reportTypeOptions(),
            'defaults' => [
                'report_type' => TaxReportType::Form1601C->value,
                'period_from' => now()->startOfMonth()->toDateString(),
                'period_to' => now()->endOfMonth()->toDateString(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreTaxReportRunRequest $request,
        GenerateTaxReportRunAction $generateTaxReportRunAction,
    ): RedirectResponse {
        $this->authorize('create', TaxReportRun::class);

        $taxReportRun = $generateTaxReportRunAction->handle(
            $request->validated(),
            $request->user(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Tax report run generated.'),
        ]);

        return to_route('tax-report-runs.show', $taxReportRun);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, TaxReportRun $taxReportRun): Response
    {
        $this->authorize('view', $taxReportRun);

        $taxReportRun->load([
            'generatedBy:id,name',
            'items' => fn ($query) => $query
                ->orderBy('record_date')
                ->orderBy('id'),
        ]);

        return Inertia::render('tax-report-runs/show', [
            'taxReportRun' => $this->reportRunDetail($request, $taxReportRun),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaxReportRun $taxReportRun): RedirectResponse
    {
        $this->authorize('delete', $taxReportRun);

        $taxReportRun->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Tax report run archived.'),
        ]);

        return to_route('tax-report-runs.index');
    }

    /**
     * Transform a report run for index display.
     *
     * @return array<string, mixed>
     */
    private function reportRunListItem(Request $request, TaxReportRun $taxReportRun): array
    {
        return [
            'id' => $taxReportRun->getKey(),
            'report_no' => $taxReportRun->report_no,
            'report_type' => $taxReportRun->report_type->value,
            'report_type_label' => $taxReportRun->report_type->label(),
            'period_from' => optional($taxReportRun->period_from)?->toDateString(),
            'period_to' => optional($taxReportRun->period_to)?->toDateString(),
            'generated_at' => optional($taxReportRun->generated_at)?->toDateTimeString(),
            'item_count' => $taxReportRun->item_count,
            'base_amount_total' => (float) $taxReportRun->base_amount_total,
            'amount_total' => (float) $taxReportRun->amount_total,
            'vat_amount_total' => (float) $taxReportRun->vat_amount_total,
            'gross_amount_total' => (float) $taxReportRun->gross_amount_total,
            'generated_by' => $taxReportRun->generatedBy?->name,
            'can' => [
                'view' => $request->user()?->can('view', $taxReportRun) ?? false,
                'delete' => $request->user()?->can('delete', $taxReportRun) ?? false,
            ],
        ];
    }

    /**
     * Transform a report run into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function reportRunDetail(Request $request, TaxReportRun $taxReportRun): array
    {
        return [
            'id' => $taxReportRun->getKey(),
            'report_no' => $taxReportRun->report_no,
            'report_type' => $taxReportRun->report_type->value,
            'report_type_label' => $taxReportRun->report_type->label(),
            'period_from' => optional($taxReportRun->period_from)?->toDateString(),
            'period_to' => optional($taxReportRun->period_to)?->toDateString(),
            'generated_at' => optional($taxReportRun->generated_at)?->toDateTimeString(),
            'item_count' => $taxReportRun->item_count,
            'base_amount_total' => (float) $taxReportRun->base_amount_total,
            'amount_total' => (float) $taxReportRun->amount_total,
            'vat_amount_total' => (float) $taxReportRun->vat_amount_total,
            'gross_amount_total' => (float) $taxReportRun->gross_amount_total,
            'remarks' => $taxReportRun->remarks,
            'generated_by' => $taxReportRun->generatedBy?->name,
            'items' => $taxReportRun->items
                ->map(fn (TaxReportItem $item) => [
                    'id' => $item->getKey(),
                    'source_record_type' => $item->source_record_type,
                    'line_type' => $item->line_type,
                    'line_type_label' => $this->lineTypeLabel($item),
                    'record_date' => optional($item->record_date)?->toDateString(),
                    'reference_no' => $item->reference_no,
                    'subject_name' => $item->subject_name,
                    'subject_tin' => $item->subject_tin,
                    'base_amount' => (float) $item->base_amount,
                    'amount' => (float) $item->amount,
                    'vat_amount' => (float) $item->vat_amount,
                    'gross_amount' => (float) $item->gross_amount,
                    'payload' => $item->payload ?? [],
                ])
                ->values()
                ->all(),
            'can' => [
                'delete' => $request->user()?->can('delete', $taxReportRun) ?? false,
            ],
        ];
    }

    /**
     * Resolve a line label for a report item.
     */
    private function lineTypeLabel(TaxReportItem $item): string
    {
        if ($item->source_record_type === 'withholding_record') {
            return WithholdingRecordType::tryFrom($item->line_type)?->label()
                ?? Str::of($item->line_type)->replace('_', ' ')->title()->toString();
        }

        if ($item->source_record_type === 'vat_record') {
            return VatRecordType::tryFrom($item->line_type)?->label()
                ?? Str::of($item->line_type)->replace('_', ' ')->title()->toString();
        }

        return Str::of($item->line_type)->replace('_', ' ')->title()->toString();
    }

    /**
     * Build filter options for available report types.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function reportTypeOptions(): array
    {
        return collect(TaxReportType::cases())
            ->map(fn (TaxReportType $reportType) => [
                'value' => $reportType->value,
                'label' => $reportType->label(),
            ])->all();
    }

    /**
     * Normalize a date filter value.
     */
    private function normalizeDateFilter(string $value): ?string
    {
        return filled($value) ? $value : null;
    }

    /**
     * Resolve the validated page size for the tax report table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
