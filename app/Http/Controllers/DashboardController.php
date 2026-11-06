<?php

namespace App\Http\Controllers;

use App\Enums\ComplianceRecordStatus;
use App\Enums\InventoryItemStatus;
use App\Enums\InvoiceStatus;
use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\StockMovementType;
use App\Enums\WorkOrderStatus;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\StockBalance;
use App\Models\StockMovement;
use App\Models\WorkOrder;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const LOW_STOCK_LIMIT = 5;

    private const RECENT_MOVEMENT_LIMIT = 5;

    private const UPCOMING_JOB_LIMIT = 5;

    private const PENDING_FOLLOW_UP_LIMIT = 5;

    private const RECENT_MOVEMENT_WINDOW_DAYS = 7;

    private const BILLING_MONTH_WINDOW = 6;

    private const COMPLIANCE_TREND_BUCKET_DAYS = 5;

    private const COMPLIANCE_TREND_BUCKETS = 7;

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

        $complianceModuleReady = config('features.compliance_tax_enabled')
            && $this->complianceModuleReady();

        $can = [
            'view_low_stock' => $user?->hasPermissionTo('inventory.view') ?? false,
            'view_stock_movements' => $user?->hasPermissionTo('stock.view') ?? false,
            'view_quotations' => $user?->can('viewAny', Quotation::class) ?? false,
            'view_projects' => $user?->can('viewAny', Project::class) ?? false,
            'view_work_orders' => $user?->can('viewAny', WorkOrder::class) ?? false,
            'view_compliance' => $complianceModuleReady
                && ($user?->can('viewAny', ComplianceRecord::class) ?? false),
            'view_compliance_alerts' => $complianceModuleReady
                && ($user?->can('viewAny', ComplianceAlert::class) ?? false),
            'view_billing' => $user?->can('viewAny', Invoice::class) ?? false,
        ];

        $lowStockCount = $can['view_low_stock'] ? $this->lowStockCount() : null;
        $lowStockItems = $can['view_low_stock'] ? $this->lowStockItems() : [];

        $recentMovementCount = $can['view_stock_movements']
            ? $this->recentMovementCount()
            : null;
        $warehouseActivity = $can['view_stock_movements']
            ? $this->warehouseActivity()
            : [];
        $recentMovements = $can['view_stock_movements']
            ? $this->recentMovementItems()
            : [];

        $pendingFollowUpData = $can['view_quotations']
            ? $this->pendingFollowUpData()
            : ['total' => null, 'items' => []];

        $upcomingJobData = $can['view_work_orders']
            ? $this->upcomingJobData()
            : ['total' => null, 'items' => []];

        return Inertia::render('dashboard', [
            'dashboard' => [
                'can' => $can,
                'inventory' => [
                    'low_stock_count' => $lowStockCount,
                    'low_stock_total' => $lowStockCount,
                    'movement_count_7_days' => $recentMovementCount,
                    'warehouse_activity' => $warehouseActivity,
                ],
                'quotations' => $can['view_quotations']
                    ? $this->quotationSummary($pendingFollowUpData['total'])
                    : $this->restrictedQuotationSummary(),
                'projects' => $can['view_projects']
                    ? $this->projectSummary()
                    : $this->restrictedProjectSummary(),
                'work_orders' => $can['view_work_orders']
                    ? $this->workOrderSummary($upcomingJobData['total'])
                    : $this->restrictedWorkOrderSummary(),
                'compliance' => $can['view_compliance']
                    ? $this->complianceSummary($can['view_compliance_alerts'])
                    : $this->restrictedComplianceSummary(),
                'monthly_billing' => $can['view_billing']
                    ? $this->monthlyBillingSummary()
                    : $this->restrictedMonthlyBillingSummary(),
                'ar_aging' => $can['view_billing']
                    ? $this->arAgingSummary()
                    : $this->restrictedArAgingSummary(),
                'low_stock' => $lowStockItems,
                'recent_movements' => $recentMovements,
                'upcoming_jobs' => $upcomingJobData['items'],
                'pending_follow_ups' => $pendingFollowUpData['items'],
            ],
        ]);
    }

    /**
     * Determine if the compliance module tables are available.
     */
    private function complianceModuleReady(): bool
    {
        return Schema::hasTable('compliance_records')
            && Schema::hasTable('compliance_alerts');
    }

    /**
     * Count the active inventory items below reorder level.
     */
    private function lowStockCount(): int
    {
        return InventoryItem::query()
            ->status(InventoryItemStatus::Active->value)
            ->belowReorderLevel()
            ->count();
    }

    /**
     * Build low-stock rows for the dashboard table.
     *
     * @return array<int, array<string, mixed>>
     */
    private function lowStockItems(): array
    {
        return InventoryItem::query()
            ->with([
                'inventoryCategory:id,name',
                'stockBalances' => fn ($query) => $query
                    ->select(['id', 'warehouse_id', 'inventory_item_id', 'quantity_on_hand'])
                    ->with('warehouse:id,warehouse_code')
                    ->orderBy('quantity_on_hand'),
            ])
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

                /** @var StockBalance|null $primaryBalance */
                $primaryBalance = $inventoryItem->stockBalances->sortBy('quantity_on_hand')->first();

                return [
                    'id' => $inventoryItem->getKey(),
                    'item_code' => $inventoryItem->item_code,
                    'item_name' => $inventoryItem->item_name,
                    'category' => $inventoryItem->inventoryCategory?->name,
                    'on_hand' => round($quantityOnHand, 2),
                    'reorder' => round($reorderLevel, 2),
                    'shortage' => round(max(0, $reorderLevel - $quantityOnHand), 2),
                    'unit' => $inventoryItem->unit,
                    'location' => $primaryBalance?->warehouse?->warehouse_code,
                ];
            })
            ->all();
    }

    /**
     * Count stock movements recorded within the recent dashboard window.
     */
    private function recentMovementCount(): int
    {
        return StockMovement::query()
            ->whereDate(
                'movement_date',
                '>=',
                now()->subDays(self::RECENT_MOVEMENT_WINDOW_DAYS - 1)->toDateString(),
            )
            ->count();
    }

    /**
     * Build the 7-day warehouse activity trend.
     *
     * @return array<int, array<string, float|string>>
     */
    private function warehouseActivity(): array
    {
        $windowStart = now()->copy()->subDays(self::RECENT_MOVEMENT_WINDOW_DAYS - 1)->startOfDay();

        /** @var Collection<int, StockMovement> $movements */
        $movements = StockMovement::query()
            ->whereDate('movement_date', '>=', $windowStart->toDateString())
            ->whereDate('movement_date', '<=', now()->toDateString())
            ->get(['movement_date', 'movement_type', 'quantity']);

        return collect(range(0, self::RECENT_MOVEMENT_WINDOW_DAYS - 1))
            ->map(function (int $offset) use ($movements, $windowStart): array {
                $date = $windowStart->copy()->addDays($offset);
                $dateKey = $date->toDateString();

                $dayMovements = $movements->filter(
                    fn (StockMovement $movement): bool => optional($movement->movement_date)?->toDateString() === $dateKey,
                );

                return [
                    'date' => $date->format('M j'),
                    'stock_in' => round(
                        $dayMovements
                            ->filter(fn (StockMovement $movement): bool => in_array(
                                $movement->movement_type,
                                [
                                    StockMovementType::StockIn,
                                    StockMovementType::AdjustmentIncrease,
                                ],
                                true,
                            ))
                            ->sum(fn (StockMovement $movement): float => (float) $movement->quantity),
                        2,
                    ),
                    'stock_out' => round(
                        $dayMovements
                            ->filter(fn (StockMovement $movement): bool => in_array(
                                $movement->movement_type,
                                [
                                    StockMovementType::StockOut,
                                    StockMovementType::AdjustmentDecrease,
                                    StockMovementType::Issuance,
                                ],
                                true,
                            ))
                            ->sum(fn (StockMovement $movement): float => (float) $movement->quantity),
                        2,
                    ),
                    'transfers' => round(
                        $dayMovements
                            ->filter(fn (StockMovement $movement): bool => $movement->movement_type === StockMovementType::Return)
                            ->sum(fn (StockMovement $movement): float => (float) $movement->quantity),
                        2,
                    ),
                ];
            })
            ->all();
    }

    /**
     * Build recent movement rows for the dashboard table.
     *
     * @return array<int, array<string, mixed>>
     */
    private function recentMovementItems(): array
    {
        return StockMovement::query()
            ->with([
                'inventoryItem:id,item_name',
                'warehouse:id,warehouse_code',
            ])
            ->whereDate(
                'movement_date',
                '>=',
                now()->subDays(self::RECENT_MOVEMENT_WINDOW_DAYS - 1)->toDateString(),
            )
            ->orderByDesc('movement_date')
            ->orderByDesc('id')
            ->limit(self::RECENT_MOVEMENT_LIMIT)
            ->get()
            ->map(function (StockMovement $stockMovement): array {
                $dashboardType = $this->dashboardMovementType($stockMovement->movement_type);
                $quantity = round((float) $stockMovement->quantity, 2);

                return [
                    'id' => $stockMovement->getKey(),
                    'date' => optional($stockMovement->movement_date)?->toDateString(),
                    'type' => $dashboardType,
                    'type_label' => match ($dashboardType) {
                        'IN' => 'Stock In',
                        'TRF' => 'Transfer',
                        default => 'Issuance',
                    },
                    'reference' => $stockMovement->reference_number,
                    'item' => $stockMovement->inventoryItem?->item_name ?? 'Unknown item',
                    'qty' => $quantity,
                    'qty_display' => sprintf(
                        '%s%s',
                        in_array($dashboardType, ['IN', 'TRF'], true) ? '+' : '-',
                        $this->formatDecimal($quantity),
                    ),
                    'location' => $stockMovement->warehouse?->warehouse_code,
                ];
            })
            ->all();
    }

    /**
     * Build the quotation dashboard summary.
     *
     * @return array<string, mixed>
     */
    private function quotationSummary(?int $pendingFollowUpTotal): array
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        /** @var Collection<int, Quotation> $quotations */
        $quotations = Quotation::query()
            ->whereDate('quotation_date', '>=', $monthStart)
            ->whereDate('quotation_date', '<=', $monthEnd)
            ->get(['status', 'quotation_amount']);

        $totalQuotations = $quotations->count();
        $wonCount = $quotations->filter(
            fn (Quotation $quotation): bool => $quotation->status === QuotationStatus::Awarded,
        )->count();
        $lostCount = $quotations->filter(
            fn (Quotation $quotation): bool => $quotation->status === QuotationStatus::Lost,
        )->count();
        $pendingCount = $quotations->filter(
            fn (Quotation $quotation): bool => in_array(
                $quotation->status,
                [
                    QuotationStatus::Draft,
                    QuotationStatus::Submitted,
                    QuotationStatus::UnderReview,
                ],
                true,
            ),
        )->count();

        return [
            'total_quotations' => $totalQuotations,
            'total_value' => round(
                $quotations->sum(fn (Quotation $quotation): float => (float) $quotation->quotation_amount),
                2,
            ),
            'conversion_rate' => $this->percentage($wonCount, $totalQuotations),
            'pending_follow_up_total' => $pendingFollowUpTotal,
            'breakdown' => [
                [
                    'key' => 'won',
                    'label' => 'Won',
                    'count' => $wonCount,
                    'percentage' => $this->percentage($wonCount, $totalQuotations),
                ],
                [
                    'key' => 'lost',
                    'label' => 'Lost',
                    'count' => $lostCount,
                    'percentage' => $this->percentage($lostCount, $totalQuotations),
                ],
                [
                    'key' => 'pending',
                    'label' => 'Pending',
                    'count' => $pendingCount,
                    'percentage' => $this->percentage($pendingCount, $totalQuotations),
                ],
            ],
        ];
    }

    /**
     * Build the project dashboard summary.
     *
     * @return array<string, mixed>
     */
    private function projectSummary(): array
    {
        /** @var Collection<int, Project> $projects */
        $projects = Project::query()
            ->with('quotation:id,quotation_amount')
            ->whereIn('status', [
                ProjectStatus::Open->value,
                ProjectStatus::InProgress->value,
                ProjectStatus::OnHold->value,
                ProjectStatus::Completed->value,
            ])
            ->get(['id', 'quotation_id', 'status']);

        $planningCount = $projects->filter(
            fn (Project $project): bool => $project->status === ProjectStatus::Open,
        )->count();
        $inProgressCount = $projects->filter(
            fn (Project $project): bool => $project->status === ProjectStatus::InProgress,
        )->count();
        $onHoldCount = $projects->filter(
            fn (Project $project): bool => $project->status === ProjectStatus::OnHold,
        )->count();
        $completedCount = $projects->filter(
            fn (Project $project): bool => $project->status === ProjectStatus::Completed,
        )->count();

        return [
            'active_projects' => $planningCount + $inProgressCount + $onHoldCount,
            'total_project_value' => round(
                $projects->sum(
                    fn (Project $project): float => (float) ($project->quotation?->quotation_amount ?? 0),
                ),
                2,
            ),
            'statuses' => [
                [
                    'key' => 'planning',
                    'label' => 'Planning',
                    'count' => $planningCount,
                ],
                [
                    'key' => 'in_progress',
                    'label' => 'In Progress',
                    'count' => $inProgressCount,
                ],
                [
                    'key' => 'on_hold',
                    'label' => 'On Hold',
                    'count' => $onHoldCount,
                ],
                [
                    'key' => 'completed',
                    'label' => 'Completed',
                    'count' => $completedCount,
                ],
            ],
        ];
    }

    /**
     * Build the work-order dashboard summary.
     *
     * @return array<string, mixed>
     */
    private function workOrderSummary(?int $upcomingJobTotal): array
    {
        /** @var Collection<int, WorkOrder> $workOrders */
        $workOrders = WorkOrder::query()
            ->whereIn('status', [
                WorkOrderStatus::Draft->value,
                WorkOrderStatus::Scheduled->value,
                WorkOrderStatus::InProgress->value,
                WorkOrderStatus::ForReview->value,
                WorkOrderStatus::Completed->value,
                WorkOrderStatus::Closed->value,
                WorkOrderStatus::Cancelled->value,
            ])
            ->get(['status']);

        $pendingCount = $workOrders->filter(
            fn (WorkOrder $workOrder): bool => $workOrder->status === WorkOrderStatus::Draft,
        )->count();
        $scheduledCount = $workOrders->filter(
            fn (WorkOrder $workOrder): bool => $workOrder->status === WorkOrderStatus::Scheduled,
        )->count();
        $inProgressCount = $workOrders->filter(
            fn (WorkOrder $workOrder): bool => $workOrder->status === WorkOrderStatus::InProgress,
        )->count();
        $completedCount = $workOrders->filter(
            fn (WorkOrder $workOrder): bool => in_array(
                $workOrder->status,
                [WorkOrderStatus::Completed, WorkOrderStatus::Closed],
                true,
            ),
        )->count();
        $cancelledCount = $workOrders->filter(
            fn (WorkOrder $workOrder): bool => $workOrder->status === WorkOrderStatus::Cancelled,
        )->count();
        $forReviewCount = $workOrders->filter(
            fn (WorkOrder $workOrder): bool => $workOrder->status === WorkOrderStatus::ForReview,
        )->count();

        $statusTotal = $pendingCount
            + $scheduledCount
            + $inProgressCount
            + $completedCount
            + $cancelledCount;

        return [
            'active_work_orders' => $statusTotal,
            'for_review_count' => $forReviewCount,
            'upcoming_job_total' => $upcomingJobTotal,
            'statuses' => [
                [
                    'key' => 'pending',
                    'label' => 'Pending',
                    'count' => $pendingCount,
                    'percentage' => $this->percentage($pendingCount, $statusTotal),
                    'color' => '#f59e0b',
                ],
                [
                    'key' => 'scheduled',
                    'label' => 'Scheduled',
                    'count' => $scheduledCount,
                    'percentage' => $this->percentage($scheduledCount, $statusTotal),
                    'color' => '#3b82f6',
                ],
                [
                    'key' => 'in_progress',
                    'label' => 'In Progress',
                    'count' => $inProgressCount,
                    'percentage' => $this->percentage($inProgressCount, $statusTotal),
                    'color' => '#f97316',
                ],
                [
                    'key' => 'completed',
                    'label' => 'Completed',
                    'count' => $completedCount,
                    'percentage' => $this->percentage($completedCount, $statusTotal),
                    'color' => '#22c55e',
                ],
                [
                    'key' => 'cancelled',
                    'label' => 'Cancelled',
                    'count' => $cancelledCount,
                    'percentage' => $this->percentage($cancelledCount, $statusTotal),
                    'color' => '#94a3b8',
                ],
            ],
        ];
    }

    /**
     * Build compliance summary metrics and the due-item trend.
     *
     * @return array<string, mixed>
     */
    private function complianceSummary(bool $canViewComplianceAlerts): array
    {
        $today = now();

        return [
            'due_soon_count' => ComplianceRecord::query()
                ->displayStatus(ComplianceRecordStatus::DueSoon->value, $today)
                ->count(),
            'for_renewal_count' => ComplianceRecord::query()
                ->displayStatus(ComplianceRecordStatus::ForRenewal->value, $today)
                ->count(),
            'overdue_count' => ComplianceRecord::query()
                ->displayStatus(ComplianceRecordStatus::Overdue->value, $today)
                ->count(),
            'expired_count' => ComplianceRecord::query()
                ->displayStatus(ComplianceRecordStatus::Expired->value, $today)
                ->count(),
            'open_alert_count' => $canViewComplianceAlerts
                ? ComplianceAlert::query()->unacknowledged()->count()
                : null,
            'due_items_trend' => $this->complianceDueItemTrend($today),
        ];
    }

    /**
     * Build the due-item trend used in the compliance widget.
     *
     * @return array<int, array{label: string, count: int}>
     */
    private function complianceDueItemTrend(CarbonInterface $today): array
    {
        $windowStart = $today->copy()->startOfDay();
        $windowEnd = $windowStart->copy()->addDays(30)->endOfDay();

        /** @var Collection<int, ComplianceRecord> $records */
        $records = ComplianceRecord::query()
            ->where('status', '!=', ComplianceRecordStatus::Archived->value)
            ->withinDeadlineWindow(
                $windowStart->toDateString(),
                $windowEnd->toDateString(),
            )
            ->get(['due_date', 'expiry_date']);

        $points = collect(range(0, self::COMPLIANCE_TREND_BUCKETS - 1))
            ->map(function (int $index) use ($windowStart): array {
                $date = $windowStart
                    ->copy()
                    ->addDays($index * self::COMPLIANCE_TREND_BUCKET_DAYS);

                return [
                    'label' => $date->format('M j'),
                    'count' => 0,
                ];
            })
            ->all();

        foreach ($records as $record) {
            foreach ([$record->due_date, $record->expiry_date] as $deadline) {
                if ($deadline === null) {
                    continue;
                }

                $daysUntilDeadline = $windowStart->diffInDays($deadline, false);

                if ($daysUntilDeadline < 0 || $daysUntilDeadline > 30) {
                    continue;
                }

                $bucketIndex = min(
                    self::COMPLIANCE_TREND_BUCKETS - 1,
                    intdiv($daysUntilDeadline, self::COMPLIANCE_TREND_BUCKET_DAYS),
                );

                $points[$bucketIndex]['count']++;
            }
        }

        return array_values($points);
    }

    /**
     * Build the monthly billing summary for the dashboard.
     *
     * @return array<string, mixed>
     */
    private function monthlyBillingSummary(): array
    {
        $months = collect(range(self::BILLING_MONTH_WINDOW - 1, 0))
            ->map(fn (int $offset) => now()->copy()->startOfMonth()->subMonths($offset));

        $totals = array_fill_keys(
            $months->map(fn (CarbonInterface $month): string => $month->format('Y-m'))->all(),
            0.0,
        );

        /** @var Collection<int, Invoice> $invoices */
        $invoices = Invoice::query()
            ->whereNotNull('invoice_date')
            ->whereDate('invoice_date', '>=', $months->first()->copy()->startOfMonth()->toDateString())
            ->whereDate('invoice_date', '<=', $months->last()->copy()->endOfMonth()->toDateString())
            ->whereNotIn('status', [
                InvoiceStatus::Draft->value,
                InvoiceStatus::Cancelled->value,
            ])
            ->get(['invoice_date', 'total_amount']);

        foreach ($invoices as $invoice) {
            $monthKey = $invoice->invoice_date?->format('Y-m');

            if ($monthKey === null || ! array_key_exists($monthKey, $totals)) {
                continue;
            }

            $totals[$monthKey] = round(
                $totals[$monthKey] + (float) $invoice->total_amount,
                2,
            );
        }

        return [
            'range_label' => sprintf(
                '%s - %s',
                $months->first()->format('M Y'),
                $months->last()->format('M Y'),
            ),
            'items' => $months->map(
                fn (CarbonInterface $month): array => [
                    'month' => $month->format('M'),
                    'amount' => $totals[$month->format('Y-m')],
                ],
            )->all(),
        ];
    }

    /**
     * Build the AR aging summary for the dashboard.
     *
     * @return array<string, mixed>
     */
    private function arAgingSummary(): array
    {
        $bucketTotals = [
            'Current' => 0.0,
            '1-30 Days' => 0.0,
            '31-60 Days' => 0.0,
            '61-90 Days' => 0.0,
            '90+ Days' => 0.0,
        ];

        /** @var Collection<int, Invoice> $invoices */
        $invoices = Invoice::query()
            ->whereNotIn('status', [
                InvoiceStatus::Draft->value,
                InvoiceStatus::Cancelled->value,
            ])
            ->get(['due_date', 'total_amount', 'balance_amount', 'status']);

        foreach ($invoices as $invoice) {
            if ($invoice->currentStatus() === InvoiceStatus::Paid) {
                continue;
            }

            $balance = round((float) $invoice->balance_amount, 2);

            if ($balance <= 0) {
                continue;
            }

            $bucketTotals[$this->arAgingBucketLabel($invoice)] = round(
                $bucketTotals[$this->arAgingBucketLabel($invoice)] + $balance,
                2,
            );
        }

        return [
            'as_of_label' => sprintf('As of %s', now()->format('M j, Y')),
            'total_ar' => round(array_sum($bucketTotals), 2),
            'items' => collect($bucketTotals)
                ->map(
                    fn (float $amount, string $bucket): array => [
                        'bucket' => $bucket,
                        'amount' => round($amount, 2),
                    ],
                )
                ->values()
                ->all(),
        ];
    }

    /**
     * Resolve the AR aging bucket label for the invoice.
     */
    private function arAgingBucketLabel(Invoice $invoice): string
    {
        $ageDays = $this->invoiceAgeDays($invoice);

        if ($ageDays === null || $ageDays <= 0) {
            return 'Current';
        }

        return match (true) {
            $ageDays <= 30 => '1-30 Days',
            $ageDays <= 60 => '31-60 Days',
            $ageDays <= 90 => '61-90 Days',
            default => '90+ Days',
        };
    }

    /**
     * Resolve the overdue age in days for the invoice.
     */
    private function invoiceAgeDays(Invoice $invoice): ?int
    {
        if ($invoice->due_date === null || (float) $invoice->balance_amount <= 0) {
            return null;
        }

        return $invoice->due_date->isPast()
            ? $invoice->due_date->diffInDays(now())
            : 0;
    }

    /**
     * Build upcoming-job rows for the dashboard.
     *
     * @return array{total: int|null, items: array<int, array<string, mixed>>}
     */
    private function upcomingJobData(): array
    {
        $query = WorkOrder::query()
            ->with([
                'customer:id,company_name',
                'customerSite:id,site_name',
            ])
            ->whereNotNull('scheduled_date')
            ->whereDate('scheduled_date', '>=', now()->toDateString())
            ->whereNotIn('status', [
                WorkOrderStatus::Completed->value,
                WorkOrderStatus::Closed->value,
                WorkOrderStatus::Cancelled->value,
            ]);

        return [
            'total' => (clone $query)->count(),
            'items' => $query
                ->orderBy('scheduled_date')
                ->orderBy('id')
                ->limit(self::UPCOMING_JOB_LIMIT)
                ->get()
                ->map(fn (WorkOrder $workOrder): array => [
                    'id' => $workOrder->getKey(),
                    'customer' => $workOrder->customer?->company_name ?? 'No customer',
                    'job_type' => $workOrder->summary,
                    'schedule_date' => optional($workOrder->scheduled_date)?->toDateString(),
                    'site' => $workOrder->customerSite?->site_name ?? 'No site',
                ])
                ->all(),
        ];
    }

    /**
     * Build pending follow-up rows for the dashboard.
     *
     * @return array{total: int|null, items: array<int, array<string, mixed>>}
     */
    private function pendingFollowUpData(): array
    {
        $query = Quotation::query()
            ->with([
                'customer:id,company_name',
                'assignedSalesUser:id,name',
            ])
            ->whereIn('status', [
                QuotationStatus::Draft->value,
                QuotationStatus::Submitted->value,
                QuotationStatus::UnderReview->value,
            ]);

        return [
            'total' => (clone $query)->count(),
            'items' => $query
                ->orderByRaw('COALESCE(valid_until, quotation_date) asc')
                ->orderBy('id')
                ->limit(self::PENDING_FOLLOW_UP_LIMIT)
                ->get()
                ->map(function (Quotation $quotation): array {
                    $dueDate = $quotation->valid_until?->toDateString()
                        ?? $quotation->quotation_date?->toDateString();

                    return [
                        'id' => $quotation->getKey(),
                        'quotation_customer' => trim(sprintf(
                            '%s - %s',
                            $quotation->quotation_no,
                            $quotation->customer?->company_name ?? 'No customer',
                        )),
                        'subject' => $quotation->subject,
                        'due_date' => $dueDate,
                        'sales_rep' => $quotation->assignedSalesUser?->name ?? 'Unassigned',
                        'is_urgent' => $dueDate !== null
                            && now()->diffInDays($dueDate, false) <= 7,
                    ];
                })
                ->all(),
        ];
    }

    /**
     * Build the restricted-state quotation summary.
     *
     * @return array<string, mixed>
     */
    private function restrictedQuotationSummary(): array
    {
        return [
            'total_quotations' => null,
            'total_value' => null,
            'conversion_rate' => null,
            'pending_follow_up_total' => null,
            'breakdown' => [],
        ];
    }

    /**
     * Build the restricted-state project summary.
     *
     * @return array<string, mixed>
     */
    private function restrictedProjectSummary(): array
    {
        return [
            'active_projects' => null,
            'total_project_value' => null,
            'statuses' => [],
        ];
    }

    /**
     * Build the restricted-state work-order summary.
     *
     * @return array<string, mixed>
     */
    private function restrictedWorkOrderSummary(): array
    {
        return [
            'active_work_orders' => null,
            'for_review_count' => null,
            'upcoming_job_total' => null,
            'statuses' => [],
        ];
    }

    /**
     * Build the restricted-state compliance summary.
     *
     * @return array<string, mixed>
     */
    private function restrictedComplianceSummary(): array
    {
        return [
            'due_soon_count' => null,
            'for_renewal_count' => null,
            'overdue_count' => null,
            'expired_count' => null,
            'open_alert_count' => null,
            'due_items_trend' => [],
        ];
    }

    /**
     * Build the restricted-state monthly billing summary.
     *
     * @return array<string, mixed>
     */
    private function restrictedMonthlyBillingSummary(): array
    {
        return [
            'range_label' => sprintf(
                '%s - %s',
                now()->copy()->subMonths(self::BILLING_MONTH_WINDOW - 1)->format('M Y'),
                now()->format('M Y'),
            ),
            'items' => [],
        ];
    }

    /**
     * Build the restricted-state AR aging summary.
     *
     * @return array<string, mixed>
     */
    private function restrictedArAgingSummary(): array
    {
        return [
            'as_of_label' => sprintf('As of %s', now()->format('M j, Y')),
            'total_ar' => null,
            'items' => [],
        ];
    }

    /**
     * Resolve the dashboard movement bucket.
     */
    private function dashboardMovementType(StockMovementType $movementType): string
    {
        return match ($movementType) {
            StockMovementType::Return => 'TRF',
            StockMovementType::StockIn,
            StockMovementType::AdjustmentIncrease => 'IN',
            default => 'ISS',
        };
    }

    /**
     * Convert a number into a human-friendly dashboard string.
     */
    private function formatDecimal(float $value): string
    {
        $formatted = number_format($value, 2, '.', '');

        return rtrim(rtrim($formatted, '0'), '.');
    }

    /**
     * Resolve the percentage for a segment.
     */
    private function percentage(int $count, int $total): int
    {
        if ($total === 0) {
            return 0;
        }

        return (int) round(($count / $total) * 100);
    }
}
