<?php

namespace App\Http\Controllers\Inventory;

use App\Actions\Inventory\StockLedgerService;
use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreStockMovementRequest;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', StockMovement::class);

        $search = $request->string('search')->toString();
        $warehouseId = $request->integer('warehouse') ?: null;
        $inventoryItemId = $request->integer('item') ?: null;
        $movementType = $request->string('type')->toString();
        $perPage = $this->resolvePerPage($request);

        $movements = StockMovement::query()
            ->with([
                'inventoryItem:id,sku,item_code,item_name,unit',
                'warehouse:id,warehouse_code,warehouse_name',
                'project:id,project_no',
                'workOrder:id,work_order_no',
                'createdBy:id,name',
            ])
            ->search($search)
            ->forWarehouse($warehouseId)
            ->forItem($inventoryItemId)
            ->type($movementType)
            ->orderByDesc('movement_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (StockMovement $stockMovement) => $this->movementListItem($stockMovement));

        return Inertia::render('stock-movements/index', [
            'movements' => $movements,
            'filters' => [
                'search' => $search,
                'warehouse' => $warehouseId,
                'item' => $inventoryItemId,
                'type' => $movementType,
                'per_page' => $perPage,
            ],
            'warehouseOptions' => $this->warehouseOptions(),
            'itemOptions' => $this->itemOptions(),
            'movementTypeOptions' => $this->movementTypeOptions(),
            'can' => [
                'create' => $request->user()?->can('create', StockMovement::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', StockMovement::class);

        $warehouseId = $request->integer('warehouse') ?: null;
        $inventoryItemId = $request->integer('item') ?: null;

        return Inertia::render('stock-movements/create', [
            'warehouseOptions' => $this->warehouseOptions(),
            'itemOptions' => $this->itemOptions(),
            'movementTypeOptions' => $this->movementTypeOptions(),
            'defaults' => [
                'warehouse_id' => $this->warehouseExists($warehouseId) ? $warehouseId : null,
                'inventory_item_id' => $this->inventoryItemExists($inventoryItemId) ? $inventoryItemId : null,
                'movement_date' => now()->toDateString(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreStockMovementRequest $request,
        StockLedgerService $stockLedgerService,
    ): RedirectResponse {
        $this->authorize('create', StockMovement::class);

        $stockLedgerService->recordManualMovement($request->validated(), $request->user());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Stock movement recorded.'),
        ]);

        return to_route('stock-movements.index');
    }

    /**
     * Transform a stock movement into an index table row.
     *
     * @return array<string, mixed>
     */
    private function movementListItem(StockMovement $stockMovement): array
    {
        return [
            'id' => $stockMovement->getKey(),
            'reference_type' => $stockMovement->reference_type,
            'reference_number' => $stockMovement->reference_number,
            'movement_type' => $stockMovement->movement_type->value,
            'movement_type_label' => $stockMovement->movement_type->label(),
            'quantity' => (float) $stockMovement->quantity,
            'balance_after' => (float) $stockMovement->balance_after,
            'unit_cost' => $stockMovement->unit_cost === null ? null : (float) $stockMovement->unit_cost,
            'movement_date' => optional($stockMovement->movement_date)?->toDateString(),
            'remarks' => $stockMovement->remarks,
            'created_by' => $stockMovement->createdBy?->name,
            'inventory_item' => [
                'id' => $stockMovement->inventoryItem?->getKey(),
                'item_code' => $stockMovement->inventoryItem?->item_code,
                'item_name' => $stockMovement->inventoryItem?->item_name,
                'unit' => $stockMovement->inventoryItem?->unit,
            ],
            'warehouse' => [
                'id' => $stockMovement->warehouse?->getKey(),
                'warehouse_code' => $stockMovement->warehouse?->warehouse_code,
                'warehouse_name' => $stockMovement->warehouse?->warehouse_name,
            ],
            'project' => [
                'id' => $stockMovement->project?->getKey(),
                'project_no' => $stockMovement->project?->project_no,
            ],
            'work_order' => [
                'id' => $stockMovement->workOrder?->getKey(),
                'work_order_no' => $stockMovement->workOrder?->work_order_no,
            ],
        ];
    }

    /**
     * Build active warehouse dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function warehouseOptions(): array
    {
        return Warehouse::query()
            ->orderBy('warehouse_name')
            ->get(['id', 'warehouse_code', 'warehouse_name'])
            ->map(fn (Warehouse $warehouse) => [
                'value' => $warehouse->getKey(),
                'label' => "{$warehouse->warehouse_code} - {$warehouse->warehouse_name}",
            ])->all();
    }

    /**
     * Build inventory item dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function itemOptions(): array
    {
        return InventoryItem::query()
            ->orderBy('item_name')
            ->get(['id', 'item_code', 'item_name', 'unit'])
            ->map(fn (InventoryItem $inventoryItem) => [
                'value' => $inventoryItem->getKey(),
                'label' => "{$inventoryItem->item_code} - {$inventoryItem->item_name} ({$inventoryItem->unit})",
            ])->all();
    }

    /**
     * Build manual movement type dropdown options.
     *
     * @return array<int, array<string, string>>
     */
    private function movementTypeOptions(): array
    {
        return collect(StockMovementType::cases())
            ->filter(fn (StockMovementType $movementType) => $movementType->isManualEntry())
            ->map(fn (StockMovementType $movementType) => [
                'value' => $movementType->value,
                'label' => $movementType->label(),
            ])->values()->all();
    }

    /**
     * Determine whether the given warehouse exists.
     */
    private function warehouseExists(?int $warehouseId): bool
    {
        return filled($warehouseId) && Warehouse::query()->whereKey($warehouseId)->exists();
    }

    /**
     * Determine whether the given inventory item exists.
     */
    private function inventoryItemExists(?int $inventoryItemId): bool
    {
        return filled($inventoryItemId) && InventoryItem::query()->whereKey($inventoryItemId)->exists();
    }

    /**
     * Resolve a supported page size for paginated listings.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
