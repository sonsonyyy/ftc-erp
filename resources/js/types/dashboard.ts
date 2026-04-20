export type DashboardLowStockItem = {
    id: number;
    item_code: string;
    item_name: string;
    unit: string;
    reorder_level: number;
    quantity_on_hand: number;
    shortage: number;
    category: {
        name: string | null;
    };
};

export type DashboardLowStockSnapshot = {
    count: number | null;
    items: DashboardLowStockItem[];
};

export type DashboardStockMovementItem = {
    id: number;
    reference_number: string | null;
    movement_type: string;
    movement_type_label: string;
    quantity: number;
    balance_after: number;
    movement_date: string | null;
    inventory_item: {
        id: number | null;
        item_code: string | null;
        item_name: string | null;
    };
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
};

export type DashboardStockMovementSnapshot = {
    last_7_days_count: number | null;
    items: DashboardStockMovementItem[];
};

export type DashboardMetricSnapshot = {
    count: number | null;
    secondary_count: number | null;
};
