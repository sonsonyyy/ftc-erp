<?php

namespace App\Http\Controllers\Inventory;

use App\Actions\Inventory\StockLedgerService;
use App\Enums\InventoryItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreStockReturnRequest;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\StockReturn;
use App\Models\Warehouse;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockReturnController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', StockReturn::class);

        $search = $request->string('search')->toString();
        $warehouseId = $request->integer('warehouse') ?: null;
        $projectId = $request->integer('project') ?: null;
        $workOrderId = $request->integer('work_order') ?: null;
        $perPage = $this->resolvePerPage($request);

        $stockReturns = StockReturn::query()
            ->with([
                'warehouse:id,warehouse_code,warehouse_name',
                'project:id,project_no,title',
                'workOrder:id,work_order_no,summary',
                'createdBy:id,name',
            ])
            ->withCount('items')
            ->withSum('items as total_quantity', 'quantity')
            ->search($search)
            ->forWarehouse($warehouseId)
            ->forProject($projectId)
            ->forWorkOrder($workOrderId)
            ->orderByDesc('returned_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (StockReturn $stockReturn) => [
                'id' => $stockReturn->getKey(),
                'return_no' => $stockReturn->return_no,
                'returned_date' => optional($stockReturn->returned_date)?->toDateString(),
                'remarks' => $stockReturn->remarks,
                'item_count' => (int) $stockReturn->getAttribute('items_count'),
                'total_quantity' => (float) ($stockReturn->getAttribute('total_quantity') ?? 0),
                'created_by' => $stockReturn->createdBy?->name,
                'warehouse' => [
                    'id' => $stockReturn->warehouse?->getKey(),
                    'warehouse_code' => $stockReturn->warehouse?->warehouse_code,
                    'warehouse_name' => $stockReturn->warehouse?->warehouse_name,
                ],
                'project' => [
                    'id' => $stockReturn->project?->getKey(),
                    'project_no' => $stockReturn->project?->project_no,
                    'title' => $stockReturn->project?->title,
                ],
                'work_order' => [
                    'id' => $stockReturn->workOrder?->getKey(),
                    'work_order_no' => $stockReturn->workOrder?->work_order_no,
                    'summary' => $stockReturn->workOrder?->summary,
                ],
                'can' => [
                    'view' => $request->user()?->can('view', $stockReturn) ?? false,
                ],
            ]);

        return Inertia::render('stock-returns/index', [
            'stockReturns' => $stockReturns,
            'filters' => [
                'search' => $search,
                'warehouse' => $warehouseId,
                'project' => $projectId,
                'work_order' => $workOrderId,
                'per_page' => $perPage,
            ],
            'warehouseOptions' => $this->warehouseOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'can' => [
                'create' => $request->user()?->can('create', StockReturn::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', StockReturn::class);

        $workOrder = filled($request->integer('work_order'))
            ? WorkOrder::query()->find($request->integer('work_order'))
            : null;

        return Inertia::render('stock-returns/create', [
            'warehouseOptions' => $this->warehouseOptions(),
            'projectOptions' => $this->projectOptions(),
            'workOrderOptions' => $this->workOrderOptions(),
            'itemOptions' => $this->itemOptions(),
            'defaults' => [
                'return_no' => 'RET-'.now()->format('YmdHis'),
                'returned_date' => now()->toDateString(),
                'project_id' => $workOrder?->project_id ?? ($request->integer('project') ?: null),
                'work_order_id' => $workOrder?->getKey() ?? null,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreStockReturnRequest $request,
        StockLedgerService $stockLedgerService,
    ): RedirectResponse {
        $this->authorize('create', StockReturn::class);

        $stockReturn = $stockLedgerService->createReturn($request->validated(), $request->user());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Stock return recorded.'),
        ]);

        return to_route('stock-returns.show', $stockReturn);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, StockReturn $stockReturn): Response
    {
        $this->authorize('view', $stockReturn);

        $stockReturn->load([
            'warehouse:id,warehouse_code,warehouse_name',
            'project:id,project_no,title',
            'workOrder:id,work_order_no,summary',
            'createdBy:id,name',
            'items.inventoryItem:id,item_code,item_name,unit',
        ]);

        return Inertia::render('stock-returns/show', [
            'stockReturn' => [
                'id' => $stockReturn->getKey(),
                'return_no' => $stockReturn->return_no,
                'returned_date' => optional($stockReturn->returned_date)?->toDateString(),
                'remarks' => $stockReturn->remarks,
                'created_by' => $stockReturn->createdBy?->name,
                'warehouse' => [
                    'id' => $stockReturn->warehouse?->getKey(),
                    'warehouse_code' => $stockReturn->warehouse?->warehouse_code,
                    'warehouse_name' => $stockReturn->warehouse?->warehouse_name,
                ],
                'project' => [
                    'id' => $stockReturn->project?->getKey(),
                    'project_no' => $stockReturn->project?->project_no,
                    'title' => $stockReturn->project?->title,
                ],
                'work_order' => [
                    'id' => $stockReturn->workOrder?->getKey(),
                    'work_order_no' => $stockReturn->workOrder?->work_order_no,
                    'summary' => $stockReturn->workOrder?->summary,
                ],
                'items' => $stockReturn->items
                    ->map(fn ($item) => [
                        'id' => $item->getKey(),
                        'quantity' => (float) $item->quantity,
                        'remarks' => $item->remarks,
                        'inventory_item' => [
                            'id' => $item->inventoryItem?->getKey(),
                            'item_code' => $item->inventoryItem?->item_code,
                            'item_name' => $item->inventoryItem?->item_name,
                            'unit' => $item->inventoryItem?->unit,
                        ],
                    ])->all(),
            ],
        ]);
    }

    /**
     * Build active warehouse dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function warehouseOptions(): array
    {
        return Warehouse::query()
            ->where('is_active', true)
            ->orderBy('warehouse_name')
            ->get(['id', 'warehouse_code', 'warehouse_name'])
            ->map(fn (Warehouse $warehouse) => [
                'value' => $warehouse->getKey(),
                'label' => "{$warehouse->warehouse_code} - {$warehouse->warehouse_name}",
            ])->all();
    }

    /**
     * Build project dropdown options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function projectOptions(): array
    {
        return Project::query()
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get(['id', 'project_no', 'title'])
            ->map(fn (Project $project) => [
                'value' => $project->getKey(),
                'label' => "{$project->project_no} - {$project->title}",
            ])->all();
    }

    /**
     * Build work order dropdown options.
     *
     * @return array<int, array<string, int|string|null>>
     */
    private function workOrderOptions(): array
    {
        return WorkOrder::query()
            ->orderByDesc('scheduled_date')
            ->orderByDesc('id')
            ->get(['id', 'project_id', 'work_order_no', 'summary'])
            ->map(fn (WorkOrder $workOrder) => [
                'value' => $workOrder->getKey(),
                'label' => "{$workOrder->work_order_no} - {$workOrder->summary}",
                'project_id' => $workOrder->project_id,
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
            ->status(InventoryItemStatus::Active->value)
            ->orderBy('item_name')
            ->get(['id', 'item_code', 'item_name', 'unit'])
            ->map(fn (InventoryItem $inventoryItem) => [
                'value' => $inventoryItem->getKey(),
                'label' => "{$inventoryItem->item_code} - {$inventoryItem->item_name} ({$inventoryItem->unit})",
            ])->all();
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
