<?php

namespace App\Http\Controllers;

use App\Enums\InventoryItemStatus;
use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\WorkOrderStatus;
use App\Models\InventoryItem;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\StockMovement;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const LOW_STOCK_LIMIT = 5;

    private const RECENT_MOVEMENT_LIMIT = 8;

    private const RECENT_MOVEMENT_WINDOW_DAYS = 7;

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user?->hasPermissionTo('dashboard.view') ?? false,
            403,
        );

        $canViewLowStock = $user?->hasPermissionTo('inventory.view') ?? false;
        $canViewStockMovements = $user?->hasPermissionTo('stock.view') ?? false;
        $canViewQuotations = $user?->can('viewAny', Quotation::class) ?? false;
        $canViewProjects = $user?->can('viewAny', Project::class) ?? false;
        $canViewWorkOrders = $user?->can('viewAny', WorkOrder::class) ?? false;

        return Inertia::render('dashboard', [
            'lowStockSnapshot' => [
                'count' => $canViewLowStock ? $this->lowStockCount() : null,
                'items' => $canViewLowStock ? $this->lowStockItems() : [],
            ],
            'movementSnapshot' => [
                'last_7_days_count' => $canViewStockMovements ? $this->recentMovementCount() : null,
                'items' => $canViewStockMovements ? $this->recentMovementItems() : [],
            ],
            'quotationSnapshot' => $canViewQuotations
                ? $this->quotationSnapshot()
                : $this->restrictedMetricSnapshot(),
            'projectSnapshot' => $canViewProjects
                ? $this->projectSnapshot()
                : $this->restrictedMetricSnapshot(),
            'workOrderSnapshot' => $canViewWorkOrders
                ? $this->workOrderSnapshot()
                : $this->restrictedMetricSnapshot(),
            'can' => [
                'view_low_stock' => $canViewLowStock,
                'view_stock_movements' => $canViewStockMovements,
                'view_quotations' => $canViewQuotations,
                'view_projects' => $canViewProjects,
                'view_work_orders' => $canViewWorkOrders,
            ],
        ]);
    }

    /**
     * Get the quotation pipeline snapshot for the dashboard.
     *
     * @return array{count: int, secondary_count: int}
     */
    private function quotationSnapshot(): array
    {
        return [
            'count' => Quotation::query()
                ->whereIn('status', $this->quotationPipelineStatuses())
                ->count(),
            'secondary_count' => Quotation::query()
                ->where('status', QuotationStatus::Awarded->value)
                ->count(),
        ];
    }

    /**
     * Get the active project snapshot for the dashboard.
     *
     * @return array{count: int, secondary_count: int}
     */
    private function projectSnapshot(): array
    {
        return [
            'count' => Project::query()
                ->whereIn('status', $this->activeProjectStatuses())
                ->count(),
            'secondary_count' => Project::query()
                ->where('status', ProjectStatus::OnHold->value)
                ->count(),
        ];
    }

    /**
     * Get the active work-order snapshot for the dashboard.
     *
     * @return array{count: int, secondary_count: int}
     */
    private function workOrderSnapshot(): array
    {
        return [
            'count' => WorkOrder::query()
                ->whereIn('status', $this->activeWorkOrderStatuses())
                ->count(),
            'secondary_count' => WorkOrder::query()
                ->where('status', WorkOrderStatus::ForReview->value)
                ->count(),
        ];
    }

    /**
     * Get an empty metric snapshot for restricted modules.
     *
     * @return array{count: null, secondary_count: null}
     */
    private function restrictedMetricSnapshot(): array
    {
        return [
            'count' => null,
            'secondary_count' => null,
        ];
    }

    /**
     * Count the active inventory items currently below reorder level.
     */
    private function lowStockCount(): int
    {
        return InventoryItem::query()
            ->status(InventoryItemStatus::Active->value)
            ->belowReorderLevel()
            ->count();
    }

    /**
     * Get the top low-stock items for the dashboard snapshot.
     *
     * @return array<int, array<string, mixed>>
     */
    private function lowStockItems(): array
    {
        return InventoryItem::query()
            ->with('inventoryCategory:id,name')
            ->withQuantityOnHand()
            ->status(InventoryItemStatus::Active->value)
            ->belowReorderLevel()
            ->orderByRaw(
                'COALESCE((SELECT SUM(stock_balances.quantity_on_hand) FROM stock_balances WHERE stock_balances.inventory_item_id = inventory_items.id), 0) asc',
            )
            ->orderByDesc('reorder_level')
            ->limit(self::LOW_STOCK_LIMIT)
            ->get()
            ->map(function (InventoryItem $inventoryItem): array {
                $quantityOnHand = (float) ($inventoryItem->getAttribute('quantity_on_hand') ?? 0);
                $reorderLevel = (float) $inventoryItem->reorder_level;

                return [
                    'id' => $inventoryItem->getKey(),
                    'item_code' => $inventoryItem->item_code,
                    'item_name' => $inventoryItem->item_name,
                    'unit' => $inventoryItem->unit,
                    'reorder_level' => $reorderLevel,
                    'quantity_on_hand' => $quantityOnHand,
                    'shortage' => max(0, round($reorderLevel - $quantityOnHand, 2)),
                    'category' => [
                        'name' => $inventoryItem->inventoryCategory?->name,
                    ],
                ];
            })->all();
    }

    /**
     * Count stock movements recorded within the recent dashboard window.
     */
    private function recentMovementCount(): int
    {
        return StockMovement::query()
            ->whereDate('movement_date', '>=', now()->subDays(self::RECENT_MOVEMENT_WINDOW_DAYS - 1)->toDateString())
            ->count();
    }

    /**
     * Get the recent stock movement snapshot for the dashboard.
     *
     * @return array<int, array<string, mixed>>
     */
    private function recentMovementItems(): array
    {
        return StockMovement::query()
            ->with([
                'inventoryItem:id,item_code,item_name',
                'warehouse:id,warehouse_code,warehouse_name',
            ])
            ->whereDate('movement_date', '>=', now()->subDays(self::RECENT_MOVEMENT_WINDOW_DAYS - 1)->toDateString())
            ->orderByDesc('movement_date')
            ->orderByDesc('id')
            ->limit(self::RECENT_MOVEMENT_LIMIT)
            ->get()
            ->map(fn (StockMovement $stockMovement) => [
                'id' => $stockMovement->getKey(),
                'reference_number' => $stockMovement->reference_number,
                'movement_type' => $stockMovement->movement_type->value,
                'movement_type_label' => $stockMovement->movement_type->label(),
                'quantity' => (float) $stockMovement->quantity,
                'balance_after' => (float) $stockMovement->balance_after,
                'movement_date' => optional($stockMovement->movement_date)?->toDateString(),
                'inventory_item' => [
                    'id' => $stockMovement->inventoryItem?->getKey(),
                    'item_code' => $stockMovement->inventoryItem?->item_code,
                    'item_name' => $stockMovement->inventoryItem?->item_name,
                ],
                'warehouse' => [
                    'id' => $stockMovement->warehouse?->getKey(),
                    'warehouse_code' => $stockMovement->warehouse?->warehouse_code,
                    'warehouse_name' => $stockMovement->warehouse?->warehouse_name,
                ],
            ])->all();
    }

    /**
     * Get statuses that should be counted in the quotation pipeline snapshot.
     *
     * @return array<int, string>
     */
    private function quotationPipelineStatuses(): array
    {
        return [
            QuotationStatus::Draft->value,
            QuotationStatus::Submitted->value,
            QuotationStatus::UnderReview->value,
            QuotationStatus::Awarded->value,
        ];
    }

    /**
     * Get statuses that should be counted as active projects.
     *
     * @return array<int, string>
     */
    private function activeProjectStatuses(): array
    {
        return [
            ProjectStatus::Open->value,
            ProjectStatus::InProgress->value,
            ProjectStatus::OnHold->value,
        ];
    }

    /**
     * Get statuses that should be counted as active work orders.
     *
     * @return array<int, string>
     */
    private function activeWorkOrderStatuses(): array
    {
        return [
            WorkOrderStatus::Scheduled->value,
            WorkOrderStatus::InProgress->value,
            WorkOrderStatus::ForReview->value,
        ];
    }
}
