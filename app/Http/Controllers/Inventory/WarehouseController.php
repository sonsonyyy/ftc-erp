<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreWarehouseRequest;
use App\Http\Requests\Inventory\UpdateWarehouseRequest;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Warehouse::class);

        $search = $request->string('search')->toString();
        $perPage = $this->resolvePerPage($request);

        $warehouses = Warehouse::query()
            ->withCount('stockBalances')
            ->withSum('stockBalances as quantity_on_hand', 'quantity_on_hand')
            ->search($search)
            ->orderBy('warehouse_name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Warehouse $warehouse) => [
                'id' => $warehouse->getKey(),
                'warehouse_code' => $warehouse->warehouse_code,
                'warehouse_name' => $warehouse->warehouse_name,
                'contact_person' => $warehouse->contact_person,
                'contact_no' => $warehouse->contact_no,
                'is_active' => $warehouse->is_active,
                'stocked_item_count' => (int) $warehouse->getAttribute('stock_balances_count'),
                'quantity_on_hand' => (float) ($warehouse->getAttribute('quantity_on_hand') ?? 0),
                'can' => [
                    'view' => $request->user()?->can('view', $warehouse) ?? false,
                    'update' => $request->user()?->can('update', $warehouse) ?? false,
                    'delete' => $request->user()?->can('delete', $warehouse) ?? false,
                ],
            ]);

        return Inertia::render('warehouses/index', [
            'warehouses' => $warehouses,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'can' => [
                'create' => $request->user()?->can('create', Warehouse::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Warehouse::class);

        return Inertia::render('warehouses/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWarehouseRequest $request): RedirectResponse
    {
        $this->authorize('create', Warehouse::class);

        $warehouse = Warehouse::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Warehouse created.'),
        ]);

        return to_route('warehouses.show', $warehouse);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Warehouse $warehouse): Response
    {
        $this->authorize('view', $warehouse);

        $warehouse->load([
            'stockBalances' => fn ($query) => $query
                ->with('inventoryItem:id,item_code,item_name,unit,reorder_level')
                ->orderByDesc('quantity_on_hand')
                ->orderByDesc('id'),
            'stockMovements' => fn ($query) => $query
                ->with([
                    'inventoryItem:id,item_code,item_name,unit',
                    'project:id,project_no',
                    'workOrder:id,work_order_no',
                    'createdBy:id,name',
                ])
                ->limit(20),
        ]);

        return Inertia::render('warehouses/show', [
            'warehouse' => [
                'id' => $warehouse->getKey(),
                'warehouse_code' => $warehouse->warehouse_code,
                'warehouse_name' => $warehouse->warehouse_name,
                'address' => $warehouse->address,
                'contact_person' => $warehouse->contact_person,
                'contact_no' => $warehouse->contact_no,
                'is_active' => $warehouse->is_active,
                'notes' => $warehouse->notes,
                'balances' => $warehouse->stockBalances
                    ->map(fn ($stockBalance) => [
                        'id' => $stockBalance->getKey(),
                        'quantity_on_hand' => (float) $stockBalance->quantity_on_hand,
                        'inventory_item' => [
                            'id' => $stockBalance->inventoryItem?->getKey(),
                            'item_code' => $stockBalance->inventoryItem?->item_code,
                            'item_name' => $stockBalance->inventoryItem?->item_name,
                            'unit' => $stockBalance->inventoryItem?->unit,
                            'reorder_level' => $stockBalance->inventoryItem?->reorder_level === null
                                ? null
                                : (float) $stockBalance->inventoryItem->reorder_level,
                        ],
                    ])->all(),
                'recent_movements' => $warehouse->stockMovements
                    ->map(fn (StockMovement $stockMovement) => [
                        'id' => $stockMovement->getKey(),
                        'reference_type' => $stockMovement->reference_type,
                        'reference_number' => $stockMovement->reference_number,
                        'movement_type' => $stockMovement->movement_type->value,
                        'movement_type_label' => $stockMovement->movement_type->label(),
                        'quantity' => (float) $stockMovement->quantity,
                        'balance_after' => (float) $stockMovement->balance_after,
                        'movement_date' => optional($stockMovement->movement_date)?->toDateString(),
                        'created_by' => $stockMovement->createdBy?->name,
                        'inventory_item' => [
                            'id' => $stockMovement->inventoryItem?->getKey(),
                            'item_code' => $stockMovement->inventoryItem?->item_code,
                            'item_name' => $stockMovement->inventoryItem?->item_name,
                            'unit' => $stockMovement->inventoryItem?->unit,
                        ],
                        'project' => [
                            'id' => $stockMovement->project?->getKey(),
                            'project_no' => $stockMovement->project?->project_no,
                        ],
                        'work_order' => [
                            'id' => $stockMovement->workOrder?->getKey(),
                            'work_order_no' => $stockMovement->workOrder?->work_order_no,
                        ],
                        'remarks' => $stockMovement->remarks,
                    ])->all(),
                'can' => [
                    'update' => $request->user()?->can('update', $warehouse) ?? false,
                    'delete' => $request->user()?->can('delete', $warehouse) ?? false,
                    'create_movement' => $request->user()?->can('create', StockMovement::class) ?? false,
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Warehouse $warehouse): Response
    {
        $this->authorize('update', $warehouse);

        return Inertia::render('warehouses/edit', [
            'warehouse' => [
                'id' => $warehouse->getKey(),
                'warehouse_code' => $warehouse->warehouse_code,
                'warehouse_name' => $warehouse->warehouse_name,
                'address' => $warehouse->address,
                'contact_person' => $warehouse->contact_person,
                'contact_no' => $warehouse->contact_no,
                'is_active' => $warehouse->is_active,
                'notes' => $warehouse->notes,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('update', $warehouse);

        $warehouse->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Warehouse updated.'),
        ]);

        return to_route('warehouses.show', $warehouse);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('delete', $warehouse);

        $warehouse->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Warehouse archived.'),
        ]);

        return to_route('warehouses.index');
    }

    /**
     * Resolve the validated page size for the warehouse table.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
