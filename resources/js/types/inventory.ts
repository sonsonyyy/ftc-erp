import type { SelectOption } from './customers';

export type InventoryCategoryListItem = {
    id: number;
    name: string;
    description: string | null;
    item_count: number;
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type InventoryCategoryFormData = {
    id?: number;
    name: string;
    description: string | null;
};

export type InventorySummary = {
    item_count: number;
    warehouse_count: number;
    low_stock_count: number;
};

export type InventoryListItem = {
    id: number;
    sku: string | null;
    item_code: string;
    item_name: string;
    unit: string;
    reorder_level: number;
    standard_cost: number | null;
    status: string;
    status_label: string;
    quantity_on_hand: number;
    is_low_stock: boolean;
    category: {
        id: number | null;
        name: string | null;
    };
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type InventoryMovementSnippet = {
    id: number;
    reference_type: string;
    reference_number: string | null;
    movement_type: string;
    movement_type_label: string;
    quantity: number;
    balance_after: number;
    movement_date: string | null;
    created_by: string | null;
    inventory_item: {
        id: number | null;
        item_code: string | null;
        item_name: string | null;
        unit?: string | null;
    };
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
    };
    work_order: {
        id: number | null;
        work_order_no: string | null;
    };
    remarks: string | null;
};

export type InventoryBalanceItem = {
    id: number;
    quantity_on_hand: number;
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
        is_active?: boolean | null;
    };
    is_low_stock: boolean;
};

export type InventoryDetail = {
    id: number;
    sku: string | null;
    item_code: string;
    item_name: string;
    unit: string;
    reorder_level: number;
    standard_cost: number | null;
    status: string;
    status_label: string;
    notes: string | null;
    quantity_on_hand: number;
    category: {
        id: number | null;
        name: string | null;
    };
    balances: InventoryBalanceItem[];
    recent_movements: InventoryMovementSnippet[];
    can: {
        update: boolean;
        delete: boolean;
        create_movement: boolean;
    };
};

export type InventoryFormData = {
    id?: number;
    sku: string | null;
    item_code: string;
    item_name: string;
    inventory_category_id: number | null;
    unit: string;
    reorder_level: number;
    standard_cost: number | null;
    status: string;
    notes: string | null;
};

export type InventoryFilters = {
    search: string;
    category: number | null;
    status: string;
    low_stock: string;
    per_page: number;
};

export type InventoryCategoryFilters = {
    search: string;
    per_page: number;
};

export type LowStockItem = {
    id: number;
    sku: string | null;
    item_code: string;
    item_name: string;
    unit: string;
    reorder_level: number;
    quantity_on_hand: number;
    shortage: number;
    category: {
        id: number | null;
        name: string | null;
    };
    can: {
        view: boolean;
    };
};

export type LowStockFilters = {
    search: string;
    category: number | null;
    warehouse: number | null;
    per_page: number;
};

export type WarehouseListItem = {
    id: number;
    warehouse_code: string;
    warehouse_name: string;
    contact_person: string | null;
    contact_no: string | null;
    is_active: boolean;
    stocked_item_count: number;
    quantity_on_hand: number;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type WarehouseBalanceItem = {
    id: number;
    quantity_on_hand: number;
    inventory_item: {
        id: number | null;
        item_code: string | null;
        item_name: string | null;
        unit: string | null;
        reorder_level: number | null;
    };
};

export type WarehouseDetail = {
    id: number;
    warehouse_code: string;
    warehouse_name: string;
    address: string | null;
    contact_person: string | null;
    contact_no: string | null;
    is_active: boolean;
    notes: string | null;
    balances: WarehouseBalanceItem[];
    recent_movements: InventoryMovementSnippet[];
    can: {
        update: boolean;
        delete: boolean;
        create_movement: boolean;
    };
};

export type WarehouseFormData = {
    id?: number;
    warehouse_code: string;
    warehouse_name: string;
    address: string | null;
    contact_person: string | null;
    contact_no: string | null;
    is_active: boolean;
    notes: string | null;
};

export type WarehouseFilters = {
    search: string;
    activity: string;
    per_page: number;
};

export type StockMovementListItem = {
    id: number;
    reference_type: string;
    reference_number: string | null;
    movement_type: string;
    movement_type_label: string;
    quantity: number;
    balance_after: number;
    unit_cost: number | null;
    movement_date: string | null;
    remarks: string | null;
    created_by: string | null;
    inventory_item: {
        id: number | null;
        item_code: string | null;
        item_name: string | null;
        unit: string | null;
    };
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
    };
    work_order: {
        id: number | null;
        work_order_no: string | null;
    };
};

export type StockMovementFormDefaults = {
    warehouse_id: number | null;
    inventory_item_id: number | null;
    movement_date: string;
};

export type StockMovementFilters = {
    search: string;
    warehouse: number | null;
    item: number | null;
    type: string;
    per_page: number;
};

export type StockLineItemInput = {
    inventory_item_id: string;
    quantity: string;
    remarks: string;
};

export type StockWorkOrderOption = {
    value: number;
    label: string;
    project_id: number | null;
};

export type StockIssuanceListItem = {
    id: number;
    issuance_no: string;
    issued_date: string | null;
    remarks: string | null;
    item_count: number;
    total_quantity: number;
    created_by: string | null;
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
    };
    work_order: {
        id: number | null;
        work_order_no: string | null;
        summary: string | null;
    };
    can: {
        view: boolean;
    };
};

export type StockIssuanceDetail = {
    id: number;
    issuance_no: string;
    issued_date: string | null;
    remarks: string | null;
    created_by: string | null;
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
    };
    work_order: {
        id: number | null;
        work_order_no: string | null;
        summary: string | null;
    };
    items: Array<{
        id: number;
        quantity: number;
        remarks: string | null;
        inventory_item: {
            id: number | null;
            item_code: string | null;
            item_name: string | null;
            unit: string | null;
        };
    }>;
};

export type StockIssuanceFilters = {
    search: string;
    warehouse: number | null;
    project: number | null;
    work_order: number | null;
    per_page: number;
};

export type StockIssuanceDefaults = {
    issuance_no: string;
    issued_date: string;
    project_id: number | null;
    work_order_id: number | null;
};

export type StockReturnListItem = {
    id: number;
    return_no: string;
    returned_date: string | null;
    remarks: string | null;
    item_count: number;
    total_quantity: number;
    created_by: string | null;
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
    };
    work_order: {
        id: number | null;
        work_order_no: string | null;
        summary: string | null;
    };
    can: {
        view: boolean;
    };
};

export type StockReturnDetail = {
    id: number;
    return_no: string;
    returned_date: string | null;
    remarks: string | null;
    created_by: string | null;
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
    };
    work_order: {
        id: number | null;
        work_order_no: string | null;
        summary: string | null;
    };
    items: Array<{
        id: number;
        quantity: number;
        remarks: string | null;
        inventory_item: {
            id: number | null;
            item_code: string | null;
            item_name: string | null;
            unit: string | null;
        };
    }>;
};

export type StockReturnFilters = {
    search: string;
    warehouse: number | null;
    project: number | null;
    work_order: number | null;
    per_page: number;
};

export type StockReturnDefaults = {
    return_no: string;
    returned_date: string;
    project_id: number | null;
    work_order_id: number | null;
};

export type InventoryCategoryOption = SelectOption;
