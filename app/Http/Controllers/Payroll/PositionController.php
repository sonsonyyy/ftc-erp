<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payroll\StorePositionRequest;
use App\Http\Requests\Payroll\UpdatePositionRequest;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PositionController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Position::class);

        $search = $request->string('search')->toString();
        $departmentId = $request->integer('department') ?: null;
        $active = $request->string('active')->toString();
        $perPage = $this->resolvePerPage($request);

        $positions = Position::query()
            ->with(['department:id,name'])
            ->withCount('employees')
            ->search($search)
            ->forDepartment($departmentId)
            ->active($active)
            ->orderBy('title')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Position $position) => $this->positionListItem($request, $position));

        return Inertia::render('positions/index', [
            'positions' => $positions,
            'filters' => [
                'search' => $search,
                'department' => $departmentId,
                'active' => $active,
                'per_page' => $perPage,
            ],
            'departmentOptions' => $this->departmentOptions(),
            'activityOptions' => $this->activityOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Position::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Position::class);

        return Inertia::render('positions/create', [
            'departmentOptions' => $this->departmentOptions(),
            'defaults' => [
                'is_active' => true,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePositionRequest $request): RedirectResponse
    {
        $this->authorize('create', Position::class);

        $position = Position::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Position created.'),
        ]);

        return to_route('positions.edit', $position);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Position $position): Response
    {
        $this->authorize('update', $position);

        $position->load(['department:id,name'])->loadCount('employees');

        return Inertia::render('positions/edit', [
            'position' => $this->positionDetail($request, $position),
            'departmentOptions' => $this->departmentOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePositionRequest $request, Position $position): RedirectResponse
    {
        $this->authorize('update', $position);

        $position->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Position updated.'),
        ]);

        return to_route('positions.edit', $position);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Position $position): RedirectResponse
    {
        $this->authorize('delete', $position);

        $position->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Position archived.'),
        ]);

        return to_route('positions.index');
    }

    /**
     * Transform a position into an index row.
     *
     * @return array<string, mixed>
     */
    private function positionListItem(Request $request, Position $position): array
    {
        return [
            'id' => $position->getKey(),
            'title' => $position->title,
            'description' => $position->description,
            'is_active' => $position->is_active,
            'employee_count' => (int) ($position->getAttribute('employees_count') ?? 0),
            'department' => [
                'id' => $position->department?->getKey(),
                'name' => $position->department?->name,
            ],
            'can' => [
                'update' => $request->user()?->can('update', $position) ?? false,
                'delete' => $request->user()?->can('delete', $position) ?? false,
            ],
        ];
    }

    /**
     * Transform a position into an edit payload.
     *
     * @return array<string, mixed>
     */
    private function positionDetail(Request $request, Position $position): array
    {
        return [
            'id' => $position->getKey(),
            'department_id' => $position->department_id,
            'title' => $position->title,
            'description' => $position->description,
            'is_active' => $position->is_active,
            'employee_count' => (int) ($position->getAttribute('employees_count') ?? 0),
            'department' => [
                'id' => $position->department?->getKey(),
                'name' => $position->department?->name,
            ],
            'can' => [
                'delete' => $request->user()?->can('delete', $position) ?? false,
            ],
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
     * Resolve the validated page size for the position table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
