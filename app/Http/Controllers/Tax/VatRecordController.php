<?php

namespace App\Http\Controllers\Tax;

use App\Enums\VatRecordType;
use App\Http\Controllers\Controller;
use App\Models\TaxReportRun;
use App\Models\VatRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VatRecordController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', VatRecord::class);

        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());
        $perPage = $this->resolvePerPage($request);

        $vatRecords = VatRecord::query()
            ->search($search)
            ->type($type)
            ->betweenRecordDates($from, $to)
            ->orderByDesc('record_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (VatRecord $record) => $this->recordListItem($record));

        return Inertia::render('vat-records/index', [
            'vatRecords' => $vatRecords,
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
     * Transform a VAT record for index display.
     *
     * @return array<string, mixed>
     */
    private function recordListItem(VatRecord $record): array
    {
        $metadata = $record->metadata ?? [];

        return [
            'id' => $record->getKey(),
            'record_type' => $record->record_type->value,
            'record_type_label' => $record->record_type->label(),
            'record_date' => optional($record->record_date)?->toDateString(),
            'reference_no' => $record->reference_no,
            'counterparty_name' => $record->counterparty_name,
            'counterparty_tin' => $record->counterparty_tin,
            'net_amount' => (float) $record->net_amount,
            'vat_amount' => (float) $record->vat_amount,
            'gross_amount' => (float) $record->gross_amount,
            'source' => [
                'type' => $record->source_type,
                'invoice_id' => data_get($metadata, 'invoice_id'),
                'invoice_no' => data_get($metadata, 'invoice_no'),
                'customer_id' => data_get($metadata, 'customer_id'),
                'customer_code' => data_get($metadata, 'customer_code'),
            ],
        ];
    }

    /**
     * Build filter options for VAT record types.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function typeOptions(): array
    {
        return collect(VatRecordType::cases())
            ->map(fn (VatRecordType $type) => [
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
     * Resolve the validated page size for the VAT table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
