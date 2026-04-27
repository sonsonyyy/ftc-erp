<?php

namespace App\Http\Controllers\Payroll;

use App\Enums\EmploymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\StoreEmployeeRequest;
use App\Http\Requests\Payroll\UpdateEmployeeRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Models\PayrollEntry;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);

        $search = $request->string('search')->toString();
        $departmentId = $request->integer('department') ?: null;
        $positionId = $request->integer('position') ?: null;
        $employmentStatus = $request->string('employment_status')->toString();
        $active = $request->string('active')->toString();
        $perPage = $this->resolvePerPage($request);

        $employees = Employee::query()
            ->with([
                'department:id,name',
                'position:id,title',
            ])
            ->withCount('payrollEntries')
            ->search($search)
            ->forDepartment($departmentId)
            ->forPosition($positionId)
            ->employmentStatus($employmentStatus)
            ->active($active)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Employee $employee) => $this->employeeListItem($request, $employee));

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'summary' => $this->employeeSummary(),
            'filters' => [
                'search' => $search,
                'department' => $departmentId,
                'position' => $positionId,
                'employment_status' => $employmentStatus,
                'active' => $active,
                'per_page' => $perPage,
            ],
            'departmentOptions' => $this->departmentOptions(),
            'positionOptions' => $this->positionOptions(),
            'employmentStatusOptions' => $this->employmentStatusOptions(),
            'activityOptions' => $this->activityOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Employee::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Employee::class);

        return Inertia::render('employees/create', [
            'departmentOptions' => $this->departmentOptions(),
            'positionOptions' => $this->positionOptions(),
            'employmentStatusOptions' => $this->employmentStatusOptions(),
            'defaults' => [
                'employee_no' => 'EMP-'.now()->format('YmdHis'),
                'employment_status' => EmploymentStatus::Regular->value,
                'is_active' => true,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        $employee = Employee::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Employee created.'),
        ]);

        return to_route('employees.show', $employee);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Employee $employee): Response
    {
        $this->authorize('view', $employee);

        $employee->load([
            'department:id,name',
            'position:id,title',
        ])->loadCount('payrollEntries');

        $employee->setRelation('payrollEntries', $employee->payrollEntries()
            ->with([
                'payrollRun:id,payroll_run_no,payroll_date,status',
            ])
            ->orderByDesc('id')
            ->limit(8)
            ->get());

        return Inertia::render('employees/show', [
            'employee' => $this->employeeDetail($request, $employee),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Employee $employee): Response
    {
        $this->authorize('update', $employee);

        $employee->load([
            'department:id,name',
            'position:id,title',
        ])->loadCount('payrollEntries');

        return Inertia::render('employees/edit', [
            'employee' => $this->employeeDetail($request, $employee, includeRelations: false),
            'departmentOptions' => $this->departmentOptions(),
            'positionOptions' => $this->positionOptions(),
            'employmentStatusOptions' => $this->employmentStatusOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        $employee->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Employee updated.'),
        ]);

        return to_route('employees.show', $employee);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);

        $employee->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Employee archived.'),
        ]);

        return to_route('employees.index');
    }

    /**
     * Transform an employee into an index row.
     *
     * @return array<string, mixed>
     */
    private function employeeListItem(Request $request, Employee $employee): array
    {
        return [
            'id' => $employee->getKey(),
            'employee_no' => $employee->employee_no,
            'full_name' => $employee->fullName(),
            'employment_status' => $employee->employment_status->value,
            'employment_status_label' => $employee->employment_status->label(),
            'hire_date' => optional($employee->hire_date)?->toDateString(),
            'basic_salary' => $employee->basic_salary === null ? null : (float) $employee->basic_salary,
            'email' => $employee->email,
            'phone' => $employee->phone,
            'is_active' => $employee->is_active,
            'payroll_entry_count' => (int) ($employee->getAttribute('payroll_entries_count') ?? 0),
            'department' => [
                'id' => $employee->department?->getKey(),
                'name' => $employee->department?->name,
            ],
            'position' => [
                'id' => $employee->position?->getKey(),
                'title' => $employee->position?->title,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $employee) ?? false,
                'update' => $request->user()?->can('update', $employee) ?? false,
                'delete' => $request->user()?->can('delete', $employee) ?? false,
            ],
        ];
    }

    /**
     * Transform an employee into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function employeeDetail(Request $request, Employee $employee, bool $includeRelations = true): array
    {
        $detail = [
            'id' => $employee->getKey(),
            'employee_no' => $employee->employee_no,
            'first_name' => $employee->first_name,
            'last_name' => $employee->last_name,
            'middle_name' => $employee->middle_name,
            'full_name' => $employee->fullName(),
            'department_id' => $employee->department_id,
            'position_id' => $employee->position_id,
            'employment_status' => $employee->employment_status->value,
            'employment_status_label' => $employee->employment_status->label(),
            'hire_date' => optional($employee->hire_date)?->toDateString(),
            'basic_salary' => $employee->basic_salary === null ? null : (float) $employee->basic_salary,
            'tin' => $employee->tin,
            'sss_no' => $employee->sss_no,
            'pagibig_no' => $employee->pagibig_no,
            'philhealth_no' => $employee->philhealth_no,
            'email' => $employee->email,
            'phone' => $employee->phone,
            'address' => $employee->address,
            'is_active' => $employee->is_active,
            'payroll_entry_count' => (int) ($employee->getAttribute('payroll_entries_count') ?? 0),
            'department' => [
                'id' => $employee->department?->getKey(),
                'name' => $employee->department?->name,
            ],
            'position' => [
                'id' => $employee->position?->getKey(),
                'title' => $employee->position?->title,
            ],
            'can' => [
                'update' => $request->user()?->can('update', $employee) ?? false,
                'delete' => $request->user()?->can('delete', $employee) ?? false,
            ],
        ];

        if (! $includeRelations) {
            return $detail;
        }

        return [
            ...$detail,
            'payroll_history' => $employee->payrollEntries
                ->map(function (PayrollEntry $entry): array {
                    return [
                        'id' => $entry->getKey(),
                        'gross_pay' => (float) $entry->gross_pay,
                        'total_deductions' => (float) $entry->total_deductions,
                        'net_pay' => (float) $entry->net_pay,
                        'payroll_run' => [
                            'id' => $entry->payrollRun?->getKey(),
                            'payroll_run_no' => $entry->payrollRun?->payroll_run_no,
                            'payroll_date' => optional($entry->payrollRun?->payroll_date)?->toDateString(),
                            'status' => $entry->payrollRun?->status?->value,
                            'status_label' => $entry->payrollRun?->status?->label(),
                        ],
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    /**
     * Build active department options.
     *
     * @return array<int, array{value:int,label:string}>
     */
    private function departmentOptions(): array
    {
        return Department::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Department $department) => [
                'value' => $department->getKey(),
                'label' => $department->name,
            ])->all();
    }

    /**
     * Build position options.
     *
     * @return array<int, array<string, mixed>>
     */
    private function positionOptions(): array
    {
        return Position::query()
            ->with('department:id,name')
            ->orderBy('title')
            ->get(['id', 'department_id', 'title'])
            ->map(fn (Position $position) => [
                'value' => $position->getKey(),
                'label' => $position->department?->name === null
                    ? $position->title
                    : "{$position->title} - {$position->department->name}",
                'department_id' => $position->department_id,
            ])->all();
    }

    /**
     * Build employee summary metrics for the index.
     *
     * @return array<string, int>
     */
    private function employeeSummary(): array
    {
        return [
            'total_employees' => Employee::query()->count(),
            'active_employees' => Employee::query()->where('is_active', true)->count(),
            'inactive_employees' => Employee::query()->where('is_active', false)->count(),
            'assigned_departments' => Employee::query()
                ->whereNotNull('department_id')
                ->distinct('department_id')
                ->count('department_id'),
        ];
    }

    /**
     * Build employment status options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function employmentStatusOptions(): array
    {
        return collect(EmploymentStatus::cases())
            ->map(fn (EmploymentStatus $employmentStatus) => [
                'value' => $employmentStatus->value,
                'label' => $employmentStatus->label(),
            ])->all();
    }

    /**
     * Build activity filter options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function activityOptions(): array
    {
        return [
            ['value' => 'active', 'label' => 'Active only'],
            ['value' => 'inactive', 'label' => 'Inactive only'],
        ];
    }

    /**
     * Resolve the validated page size for the employee table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
