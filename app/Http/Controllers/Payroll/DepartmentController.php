<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\StoreDepartmentRequest;
use App\Http\Requests\Payroll\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Department::class);

        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $perPage = $this->resolvePerPage($request);

        $departments = Department::query()
            ->withCount(['positions', 'employees'])
            ->search($search)
            ->active($status)
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Department $department) => $this->departmentListItem($request, $department));

        return Inertia::render('departments/index', [
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'statusOptions' => $this->activityOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Department::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Department::class);

        return Inertia::render('departments/create', [
            'defaults' => [
                'is_active' => true,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $this->authorize('create', Department::class);

        $department = Department::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Department created.'),
        ]);

        return to_route('departments.edit', $department);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Department $department): Response
    {
        $this->authorize('update', $department);

        $department->loadCount(['positions', 'employees']);

        return Inertia::render('departments/edit', [
            'department' => $this->departmentDetail($request, $department),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $this->authorize('update', $department);

        $department->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Department updated.'),
        ]);

        return to_route('departments.edit', $department);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department): RedirectResponse
    {
        $this->authorize('delete', $department);

        $department->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Department archived.'),
        ]);

        return to_route('departments.index');
    }

    /**
     * Transform a department into an index row.
     *
     * @return array<string, mixed>
     */
    private function departmentListItem(Request $request, Department $department): array
    {
        return [
            'id' => $department->getKey(),
            'name' => $department->name,
            'description' => $department->description,
            'is_active' => $department->is_active,
            'position_count' => (int) ($department->getAttribute('positions_count') ?? 0),
            'employee_count' => (int) ($department->getAttribute('employees_count') ?? 0),
            'can' => [
                'update' => $request->user()?->can('update', $department) ?? false,
                'delete' => $request->user()?->can('delete', $department) ?? false,
            ],
        ];
    }

    /**
     * Transform a department into an edit payload.
     *
     * @return array<string, mixed>
     */
    private function departmentDetail(Request $request, Department $department): array
    {
        return [
            'id' => $department->getKey(),
            'name' => $department->name,
            'description' => $department->description,
            'is_active' => $department->is_active,
            'position_count' => (int) ($department->getAttribute('positions_count') ?? 0),
            'employee_count' => (int) ($department->getAttribute('employees_count') ?? 0),
            'can' => [
                'delete' => $request->user()?->can('delete', $department) ?? false,
            ],
        ];
    }

    /**
     * Build activity filter options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function activityOptions(): array
    {
        return [
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'inactive', 'label' => 'Inactive'],
        ];
    }

    /**
     * Resolve the validated page size for the department table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
