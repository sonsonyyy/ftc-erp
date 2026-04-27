<?php

namespace App\Http\Controllers\Tax;

use App\Enums\WithholdingRecordType;
use App\Http\Controllers\Controller;
use App\Models\TaxReportRun;
use App\Models\WithholdingRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WithholdingRecordController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WithholdingRecord::class);

        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());
        $perPage = $this->resolvePerPage($request);

        $withholdingRecords = WithholdingRecord::query()
            ->search($search)
            ->type($type)
            ->betweenRecordDates($from, $to)
            ->orderByDesc('record_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (WithholdingRecord $record) => $this->recordListItem($record));

        return Inertia::render('withholding-records/index', [
            'withholdingRecords' => $withholdingRecords,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'from' => $from,
                'to' => $to,
                'per_page' => $perPage,
            ],
            'typeOptions' => $this->typeOptions(),
            'can' => [
                'generate_reports' => $request->user()?->can('create', TaxReportRun::class) ?? false,
            ],
        ]);
    }

    /**
     * Transform a source record for index display.
     *
     * @return array<string, mixed>
     */
    private function recordListItem(WithholdingRecord $record): array
    {
        $metadata = $record->metadata ?? [];

        return [
            'id' => $record->getKey(),
            'record_type' => $record->record_type->value,
            'record_type_label' => $record->record_type->label(),
            'record_date' => optional($record->record_date)?->toDateString(),
            'reference_no' => $record->reference_no,
            'subject_name' => $record->subject_name,
            'subject_tin' => $record->subject_tin,
            'subject_identifier' => $record->subject_identifier,
            'base_amount' => (float) $record->base_amount,
            'amount' => (float) $record->amount,
            'source' => [
                'type' => $record->source_type,
                'payroll_run_id' => data_get($metadata, 'payroll_run_id'),
                'payroll_run_no' => data_get($metadata, 'payroll_run_no'),
                'employee_id' => data_get($metadata, 'employee_id'),
                'employee_no' => data_get($metadata, 'employee_no'),
            ],
        ];
    }

    /**
     * Build filter options for record types.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function typeOptions(): array
    {
        return collect(WithholdingRecordType::cases())
            ->map(fn (WithholdingRecordType $type) => [
                'value' => $type->value,
                'label' => $type->label(),
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
     * Resolve the validated page size for the withholding table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
