<?php

namespace App\Http\Controllers\Inventory;

use App\Enums\InventoryItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryItemRequest;
use App\Http\Requests\Inventory\UpdateInventoryItemRequest;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryItemController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', InventoryItem::class);

        $search = $request->string('search')->toString();
        $categoryId = $request->integer('category') ?: null;
        $status = $request->string('status')->toString();
        $lowStockOnly = $request->string('low_stock')->toString() === '1';

        $inventoryItems = InventoryItem::query()
            ->with('inventoryCategory:id,name')
            ->withQuantityOnHand()
            ->search($search)
            ->forCategory($categoryId)
            ->status($status)
            ->when($lowStockOnly, fn ($query) => $query->belowReorderLevel())
            ->orderBy('item_name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (InventoryItem $inventoryItem) => $this->inventoryListItem($request, $inventoryItem));

        return Inertia::render('inventory/index', [
            'inventoryItems' => $inventoryItems,
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'status' => $status,
                'low_stock' => $lowStockOnly ? '1' : '',
            ],
            'categoryOptions' => $this->categoryOptions(),
            'statusOptions' => $this->statusOptions(),
            'summary' => $this->inventorySummary(),
            'can' => [
                'create' => $request->user()?->can('create', InventoryItem::class) ?? false,
                'manage_categories' => $request->user()?->can('viewAny', InventoryCategory::class) ?? false,
                'view_low_stock' => $request->user()?->can('viewAny', InventoryItem::class) ?? false,
            ],
        ]);
    }

    /**
     * Display low-stock visibility for warehouse and management users.
     */
    public function lowStock(Request $request): Response
    {
        $this->authorize('viewAny', InventoryItem::class);

        $search = $request->string('search')->toString();
        $categoryId = $request->integer('category') ?: null;
        $warehouseId = $request->integer('warehouse') ?: null;

        $lowStockItems = InventoryItem::query()
            ->with('inventoryCategory:id,name')
            ->withQuantityOnHand($warehouseId, 'selected_quantity_on_hand')
            ->search($search)
            ->forCategory($categoryId)
            ->status(InventoryItemStatus::Active->value)
            ->belowReorderLevel($warehouseId)
            ->orderBy('item_name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (InventoryItem $inventoryItem) => [
                'id' => $inventoryItem->getKey(),
                'sku' => $inventoryItem->sku,
                'item_code' => $inventoryItem->item_code,
                'item_name' => $inventoryItem->item_name,
                'unit' => $inventoryItem->unit,
                'reorder_level' => (float) $inventoryItem->reorder_level,
                'quantity_on_hand' => (float) ($inventoryItem->getAttribute('selected_quantity_on_hand') ?? 0),
                'shortage' => max(
                    0,
                    round(
                        (float) $inventoryItem->reorder_level
                            - (float) ($inventoryItem->getAttribute('selected_quantity_on_hand') ?? 0),
                        2,
                    ),
                ),
                'category' => [
                    'id' => $inventoryItem->inventoryCategory?->getKey(),
                    'name' => $inventoryItem->inventoryCategory?->name,
                ],
                'can' => [
                    'view' => $request->user()?->can('view', $inventoryItem) ?? false,
                ],
            ]);

        return Inertia::render('inventory/low-stock', [
            'lowStockItems' => $lowStockItems,
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'warehouse' => $warehouseId,
            ],
            'categoryOptions' => $this->categoryOptions(),
            'warehouseOptions' => $this->warehouseOptions(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', InventoryItem::class);

        return Inertia::render('inventory/create', [
            'categoryOptions' => $this->categoryOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        $this->authorize('create', InventoryItem::class);

        $inventoryItem = InventoryItem::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inventory item created.'),
        ]);

        return to_route('inventory.show', $inventoryItem);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, InventoryItem $inventory): Response
    {
        $this->authorize('view', $inventory);

        $inventory->load([
            'inventoryCategory:id,name',
            'stockBalances' => fn ($query) => $query
                ->with('warehouse:id,warehouse_code,warehouse_name,is_active')
                ->orderByDesc('quantity_on_hand')
                ->orderByDesc('id'),
            'stockMovements' => fn ($query) => $query
                ->with([
                    'warehouse:id,warehouse_code,warehouse_name',
                    'project:id,project_no',
                    'workOrder:id,work_order_no',
                    'createdBy:id,name',
                ])
                ->limit(20),
        ]);

        return Inertia::render('inventory/show', [
            'inventoryItem' => $this->inventoryDetail($request, $inventory),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryItem $inventory): Response
    {
        $this->authorize('update', $inventory);

        return Inertia::render('inventory/edit', [
            'inventoryItem' => [
                'id' => $inventory->getKey(),
                'sku' => $inventory->sku,
                'item_code' => $inventory->item_code,
                'item_name' => $inventory->item_name,
                'inventory_category_id' => $inventory->inventory_category_id,
                'unit' => $inventory->unit,
                'reorder_level' => (float) $inventory->reorder_level,
                'standard_cost' => $inventory->standard_cost === null ? null : (float) $inventory->standard_cost,
                'status' => $inventory->status->value,
                'notes' => $inventory->notes,
            ],
            'categoryOptions' => $this->categoryOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventory): RedirectResponse
    {
        $this->authorize('update', $inventory);

        $inventory->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inventory item updated.'),
        ]);

        return to_route('inventory.show', $inventory);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryItem $inventory): RedirectResponse
    {
        $this->authorize('delete', $inventory);

        $inventory->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inventory item archived.'),
        ]);

        return to_route('inventory.index');
    }

    /**
     * Transform an inventory item into an index row.
     *
     * @return array<string, mixed>
     */
    private function inventoryListItem(Request $request, InventoryItem $inventoryItem): array
    {
        $quantityOnHand = (float) ($inventoryItem->getAttribute('quantity_on_hand') ?? 0);

        return [
            'id' => $inventoryItem->getKey(),
            'sku' => $inventoryItem->sku,
            'item_code' => $inventoryItem->item_code,
            'item_name' => $inventoryItem->item_name,
            'unit' => $inventoryItem->unit,
            'reorder_level' => (float) $inventoryItem->reorder_level,
            'standard_cost' => $inventoryItem->standard_cost === null ? null : (float) $inventoryItem->standard_cost,
            'status' => $inventoryItem->status->value,
            'status_label' => $inventoryItem->status->label(),
            'quantity_on_hand' => $quantityOnHand,
            'is_low_stock' => $quantityOnHand < (float) $inventoryItem->reorder_level,
            'category' => [
                'id' => $inventoryItem->inventoryCategory?->getKey(),
                'name' => $inventoryItem->inventoryCategory?->name,
            ],
            'can' => [
                'view' => $request->user()?->can('view', $inventoryItem) ?? false,
                'update' => $request->user()?->can('update', $inventoryItem) ?? false,
                'delete' => $request->user()?->can('delete', $inventoryItem) ?? false,
            ],
        ];
    }

    /**
     * Transform an inventory item into a detail payload.
     *
     * @return array<string, mixed>
     */
    private function inventoryDetail(Request $request, InventoryItem $inventoryItem): array
    {
        $balances = $inventoryItem->stockBalances
            ->map(fn ($stockBalance) => [
                'id' => $stockBalance->getKey(),
                'quantity_on_hand' => (float) $stockBalance->quantity_on_hand,
                'warehouse' => [
                    'id' => $stockBalance->warehouse?->getKey(),
                    'warehouse_code' => $stockBalance->warehouse?->warehouse_code,
                    'warehouse_name' => $stockBalance->warehouse?->warehouse_name,
                    'is_active' => $stockBalance->warehouse?->is_active,
                ],
                'is_low_stock' => (float) $stockBalance->quantity_on_hand < (float) $inventoryItem->reorder_level,
            ])->all();

        return [
            'id' => $inventoryItem->getKey(),
            'sku' => $inventoryItem->sku,
            'item_code' => $inventoryItem->item_code,
            'item_name' => $inventoryItem->item_name,
            'unit' => $inventoryItem->unit,
            'reorder_level' => (float) $inventoryItem->reorder_level,
            'standard_cost' => $inventoryItem->standard_cost === null ? null : (float) $inventoryItem->standard_cost,
            'status' => $inventoryItem->status->value,
            'status_label' => $inventoryItem->status->label(),
            'notes' => $inventoryItem->notes,
            'category' => [
                'id' => $inventoryItem->inventoryCategory?->getKey(),
                'name' => $inventoryItem->inventoryCategory?->name,
            ],
            'balances' => $balances,
            'quantity_on_hand' => round(collect($balances)->sum('quantity_on_hand'), 2),
            'recent_movements' => $inventoryItem->stockMovements
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
                    'remarks' => $stockMovement->remarks,
                ])->all(),
            'can' => [
                'update' => $request->user()?->can('update', $inventoryItem) ?? false,
                'delete' => $request->user()?->can('delete', $inventoryItem) ?? false,
                'create_movement' => $request->user()?->can('create', StockMovement::class) ?? false,
            ],
        ];
    }

    /**
     * Build category dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function categoryOptions(): array
    {
        return InventoryCategory::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (InventoryCategory $inventoryCategory) => [
                'value' => $inventoryCategory->getKey(),
                'label' => $inventoryCategory->name,
            ])->all();
    }

    /**
     * Build inventory item status options.
     *
     * @return array<int, array<string, string>>
     */
    private function statusOptions(): array
    {
        return collect(InventoryItemStatus::cases())
            ->map(fn (InventoryItemStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all();
    }

    /**
     * Build warehouse dropdown options.
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
     * Build the top-line inventory summary.
     *
     * @return array<string, int>
     */
    private function inventorySummary(): array
    {
        return [
            'item_count' => InventoryItem::query()->count(),
            'warehouse_count' => Warehouse::query()->count(),
            'low_stock_count' => InventoryItem::query()
                ->status(InventoryItemStatus::Active->value)
                ->belowReorderLevel()
                ->count(),
        ];
    }
}
