export type WarehouseActivityDatum = {
    date: string;
    stock_in: number;
    stock_out: number;
    transfers: number;
};

export type MonthlyBillingDatum = {
    month: string;
    amount: number;
};

export type ArAgingDatum = {
    bucket: string;
    amount: number;
};

export type LowStockItem = {
    id: number;
    item_code: string;
    item_name: string;
    category: string | null;
    on_hand: number;
    reorder: number;
    shortage: number;
    unit: string;
    location: string | null;
};

export type RecentMovement = {
    id: number;
    date: string | null;
    type: 'IN' | 'ISS' | 'TRF';
    type_label: string;
    reference: string | null;
    item: string;
    qty: number;
    qty_display: string;
    location: string | null;
};

export type UpcomingJob = {
    id: number;
    customer: string;
    job_type: string;
    schedule_date: string | null;
    site: string;
};

export type PendingFollowUp = {
    id: number;
    quotation_customer: string;
    subject: string;
    due_date: string | null;
    sales_rep: string;
    is_urgent: boolean;
};

export type QuotationBreakdownItem = {
    key: 'won' | 'lost' | 'pending';
    label: string;
    count: number;
    percentage: number;
};

export type ProjectStatusSummaryItem = {
    key: 'planning' | 'in_progress' | 'on_hold' | 'completed';
    label: string;
    count: number;
};

export type WorkOrderStatusSummaryItem = {
    key: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    label: string;
    count: number;
    percentage: number;
    color: string;
};

export type ComplianceTrendDatum = {
    label: string;
    count: number;
};

export type InventorySummary = {
    low_stock_count: number | null;
    low_stock_total: number | null;
    movement_count_7_days: number | null;
    warehouse_activity: WarehouseActivityDatum[];
};

export type QuotationSummary = {
    total_quotations: number | null;
    total_value: number | null;
    conversion_rate: number | null;
    pending_follow_up_total: number | null;
    breakdown: QuotationBreakdownItem[];
};

export type ProjectSummary = {
    active_projects: number | null;
    total_project_value: number | null;
    statuses: ProjectStatusSummaryItem[];
};

export type WorkOrderSummary = {
    active_work_orders: number | null;
    for_review_count: number | null;
    upcoming_job_total: number | null;
    statuses: WorkOrderStatusSummaryItem[];
};

export type ComplianceSummary = {
    due_soon_count: number | null;
    for_renewal_count: number | null;
    overdue_count: number | null;
    expired_count: number | null;
    open_alert_count: number | null;
    due_items_trend: ComplianceTrendDatum[];
};

export type MonthlyBillingSummary = {
    range_label: string;
    items: MonthlyBillingDatum[];
};

export type ArAgingSummary = {
    as_of_label: string;
    total_ar: number | null;
    items: ArAgingDatum[];
};

export type DashboardPermissions = {
    view_low_stock: boolean;
    view_stock_movements: boolean;
    view_quotations: boolean;
    view_projects: boolean;
    view_work_orders: boolean;
    view_compliance: boolean;
    view_compliance_alerts: boolean;
    view_billing: boolean;
};

export type DashboardData = {
    can: DashboardPermissions;
    inventory: InventorySummary;
    quotations: QuotationSummary;
    projects: ProjectSummary;
    work_orders: WorkOrderSummary;
    compliance: ComplianceSummary;
    monthly_billing: MonthlyBillingSummary;
    ar_aging: ArAgingSummary;
    low_stock: LowStockItem[];
    recent_movements: RecentMovement[];
    upcoming_jobs: UpcomingJob[];
    pending_follow_ups: PendingFollowUp[];
};
