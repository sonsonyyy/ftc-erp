<?php

namespace App\Http\Controllers\Payroll;

use App\Actions\Payroll\SyncPayrollRunAction;
use App\Actions\Tax\SyncPayrollWithholdingRecordsAction;
use App\Enums\PayrollRunStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\StorePayrollRunRequest;
use App\Http\Requests\Payroll\UpdatePayrollRunRequest;
use App\Models\Employee;
use App\Models\PayrollDeduction;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollRunController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', PayrollRun::class);

        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());

        $payrollRuns = PayrollRun::query()
            ->with('preparedBy:id,name')
            ->withCount('entries')
            ->search($search)
            ->status($status)
            ->betweenPayrollDates($from, $to)
            ->orderByDesc('payroll_date')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (PayrollRun $payrollRun) => $this->payrollRunListItem($request, $payrollRun));

        return Inertia::render('payroll-runs/index', [
            'payrollRuns' => $payrollRuns,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'from' => $from,
                'to' => $to,
            ],
            'statusOptions' => $this->statusOptions(),
            'can' => [
                'create' => $request->user()?->can('create', PayrollRun::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', PayrollRun::class);

        return Inertia::render('payroll-runs/create', [
            'employeeOptions' => $this->employeeOptions(),
            'statusOptions' => $this->statusOptions(),
            'defaults' => [
                'payroll_run_no' => 'PR-'.now()->format('YmdHis'),
                'period_from' => now()->startOfMonth()->toDateString(),
                'period_to' => now()->endOfMonth()->toDateString(),
                'payroll_date' => now()->toDateString(),
                'status' => PayrollRunStatus::Draft->value,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollRunRequest $request, SyncPayrollRunAction $syncPayrollRunAction): RedirectResponse
    {
        $this->authorize('create', PayrollRun::class);

        $payrollRun = $syncPayrollRunAction->handle(
            $request->validated(),
            null,
            $request->user(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payroll run created.'),
        ]);

        return to_route('payroll-runs.show', $payrollRun);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, PayrollRun $payrollRun): Response
    {
        $this->authorize('view', $payrollRun);

        $payrollRun->load([
            'preparedBy:id,name',
            'entries' => fn ($query) => $query
                ->with([
                    'employee:id,employee_no,first_name,last_name,middle_name,department_id,position_id',
                    'employee.department:id,name',
                    'employee.position:id,title',
                    'deductions:id,payroll_entry_id,deduction_name,amount,remarks',
                ])
                ->orderBy('id'),
        ])->loadCount('entries');

        return Inertia::render('payroll-runs/show', [
            'payrollRun' => $this->payrollRunDetail($request, $payrollRun),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, PayrollRun $payrollRun): Response
    {
        $this->authorize('update', $payrollRun);

        $payrollRun->load([
            'entries' => fn ($query) => $query
                ->with([
                    'employee:id,employee_no,first_name,last_name,middle_name,department_id,position_id,basic_salary',
                    'employee.department:id,name',
                    'employee.position:id,title',
                    'deductions:id,payroll_entry_id,deduction_name,amount,remarks',
                ])
                ->orderBy('id'),
        ])->loadCount('entries');

        return Inertia::render('payroll-runs/edit', [
            'payrollRun' => $this->payrollRunDetail($request, $payrollRun),
            'employeeOptions' => $this->employeeOptions(
                $payrollRun->entries->pluck('employee_id')->all(),
            ),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdatePayrollRunRequest $request,
        PayrollRun $payrollRun,
        SyncPayrollRunAction $syncPayrollRunAction,
    ): RedirectResponse {
        $this->authorize('update', $payrollRun);

        $syncPayrollRunAction->handle(
            $request->validated(),
            $payrollRun,
            $request->user(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payroll run updated.'),
        ]);

        return to_route('payroll-runs.show', $payrollRun);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(
        PayrollRun $payrollRun,
        SyncPayrollWithholdingRecordsAction $syncPayrollWithholdingRecordsAction,
    ): RedirectResponse {
        $this->authorize('delete', $payrollRun);

        $syncPayrollWithholdingRecordsAction->deleteForEntryIds(
            $payrollRun->entries()->pluck('id')->all(),
        );
        $payrollRun->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Payroll run archived.'),
        ]);

        return to_route('payroll-runs.index');
    }

    /**
     * Transform a payroll run into an index row.
     *
     * @return array<string, mixed>
     */
    private function payrollRunListItem(Request $request, PayrollRun $payrollRun): array
    {
        return [
            'id' => $payrollRun->getKey(),
            'payroll_run_no' => $payrollRun->payroll_run_no,
            'period_from' => optional($payrollRun->period_from)?->toDateString(),
            'period_to' => optional($payrollRun->period_to)?->toDateString(),
            'payroll_date' => optional($payrollRun->payroll_date)?->toDateString(),
            'status' => $payrollRun->status->value,
            'status_label' => $payrollRun->status->label(),
            'gross_total' => (float) $payrollRun->gross_total,
            'total_deductions' => (float) $payrollRun->total_deductions,
            'net_total' => (float) $payrollRun->net_total,
            'entry_count' => (int) ($payrollRun->getAttribute('entries_count') ?? 0),
            'prepared_by' => $payrollRun->preparedBy?->name,
            'can' => [
                'view' => $request->user()?->can('view', $payrollRun) ?? false,
                'update' => $request->user()?->can('update', $payrollRun) ?? false,
                'delete' => $request->user()?->can('delete', $payrollRun) ?? false,
            ],
        ];
    }

    /**
     * Transform a payroll run into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function payrollRunDetail(Request $request, PayrollRun $payrollRun): array
    {
        return [
            'id' => $payrollRun->getKey(),
            'payroll_run_no' => $payrollRun->payroll_run_no,
            'period_from' => optional($payrollRun->period_from)?->toDateString(),
            'period_to' => optional($payrollRun->period_to)?->toDateString(),
            'payroll_date' => optional($payrollRun->payroll_date)?->toDateString(),
            'status' => $payrollRun->status->value,
            'status_label' => $payrollRun->status->label(),
            'gross_total' => (float) $payrollRun->gross_total,
            'total_deductions' => (float) $payrollRun->total_deductions,
            'net_total' => (float) $payrollRun->net_total,
            'remarks' => $payrollRun->remarks,
            'entry_count' => (int) ($payrollRun->getAttribute('entries_count') ?? 0),
            'prepared_by' => $payrollRun->preparedBy?->name,
            'entries' => $payrollRun->entries
                ->map(function (PayrollEntry $entry): array {
                    return [
                        'id' => $entry->getKey(),
                        'employee_id' => $entry->employee_id,
                        'gross_pay' => (float) $entry->gross_pay,
                        'tax_amount' => (float) $entry->tax_amount,
                        'sss_amount' => (float) $entry->sss_amount,
                        'pagibig_amount' => (float) $entry->pagibig_amount,
                        'philhealth_amount' => (float) $entry->philhealth_amount,
                        'other_deductions_amount' => (float) $entry->other_deductions_amount,
                        'total_deductions' => (float) $entry->total_deductions,
                        'net_pay' => (float) $entry->net_pay,
                        'remarks' => $entry->remarks,
                        'employee' => [
                            'id' => $entry->employee?->getKey(),
                            'employee_no' => $entry->employee?->employee_no,
                            'full_name' => $entry->employee?->fullName(),
                            'department_name' => $entry->employee?->department?->name,
                            'position_title' => $entry->employee?->position?->title,
                        ],
                        'deductions' => $entry->deductions
                            ->map(fn (PayrollDeduction $deduction) => [
                                'id' => $deduction->getKey(),
                                'deduction_name' => $deduction->deduction_name,
                                'amount' => (float) $deduction->amount,
                                'remarks' => $deduction->remarks,
                            ])
                            ->values()
                            ->all(),
                    ];
                })
                ->values()
                ->all(),
            'can' => [
                'update' => $request->user()?->can('update', $payrollRun) ?? false,
                'delete' => $request->user()?->can('delete', $payrollRun) ?? false,
            ],
        ];
    }

    /**
     * Build employee options for payroll entry lines.
     *
     * @param  array<int, int>  $includeIds
     * @return array<int, array<string, mixed>>
     */
    private function employeeOptions(array $includeIds = []): array
    {
        $uniqueIncludeIds = collect($includeIds)
            ->filter()
            ->map(fn (mixed $id): int => (int) $id)
            ->unique()
            ->values()
            ->all();

        return Employee::query()
            ->with([
                'department:id,name',
                'position:id,title',
            ])
            ->where(function ($query) use ($uniqueIncludeIds): void {
                $query->where('is_active', true);

                if ($uniqueIncludeIds !== []) {
                    $query->orWhereIn('id', $uniqueIncludeIds);
                }
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get([
                'id',
                'employee_no',
                'first_name',
                'last_name',
                'middle_name',
                'department_id',
                'position_id',
                'basic_salary',
            ])
            ->map(fn (Employee $employee) => [
                'value' => $employee->getKey(),
                'label' => "{$employee->employee_no} - {$employee->fullName()}",
                'basic_salary' => $employee->basic_salary === null ? null : (float) $employee->basic_salary,
                'department_name' => $employee->department?->name,
                'position_title' => $employee->position?->title,
            ])
            ->all();
    }

    /**
     * Build payroll run status options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function statusOptions(): array
    {
        return collect(PayrollRunStatus::cases())
            ->map(fn (PayrollRunStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all();
    }

    /**
     * Normalize a date filter value.
     */
    private function normalizeDateFilter(string $value): ?string
    {
        return filled($value) ? $value : null;
    }
}
