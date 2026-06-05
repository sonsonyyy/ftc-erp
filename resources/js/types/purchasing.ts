import type { AttachmentItem, SelectOption } from './customers';

export type SupplierListItem = {
    id: number;
    supplier_code: string;
    company_name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    payment_terms: string | null;
    is_active: boolean;
    activity_label: string;
    purchase_request_count: number;
    purchase_order_count: number;
    attachment_count: number;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type SupplierFilters = {
    search: string;
    status: string;
    per_page: number;
};

export type SupplierPurchaseRequestSnippet = {
    id: number;
    request_no: string;
    status: string;
    status_label: string;
    request_date: string | null;
    purpose: string;
    item_count: number;
    purchase_order_count: number;
    attachment_count: number;
    can: {
        view: boolean;
    };
};

export type SupplierPurchaseOrderSnippet = {
    id: number;
    po_no: string;
    status: string;
    status_label: string;
    order_date: string | null;
    receipt_count: number;
    attachment_count: number;
    ordered_quantity_total: number;
    received_quantity_total: number;
    can: {
        view: boolean;
    };
};

export type SupplierDetail = {
    id: number;
    supplier_code: string;
    company_name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    tin: string | null;
    address: string | null;
    payment_terms: string | null;
    is_active: boolean;
    activity_label: string;
    notes: string | null;
    purchase_request_count: number;
    purchase_order_count: number;
    attachment_count: number;
    attachments?: AttachmentItem[];
    purchase_requests?: SupplierPurchaseRequestSnippet[];
    purchase_orders?: SupplierPurchaseOrderSnippet[];
    can: {
        update: boolean;
        delete: boolean;
        create_purchase_request: boolean;
        create_purchase_order: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type PurchaseRequestFilters = {
    search: string;
    status: string;
    per_page: number;
};

export type PurchaseRequestLineInput = {
    inventory_item_id: string;
    requested_quantity: string;
    estimated_unit_cost: string;
    remarks: string;
};

export type PurchasingWorkOrderOption = {
    value: number;
    label: string;
    project_id: number | null;
};

export type PurchasingItemOption = {
    value: number;
    label: string;
    unit: string;
    standard_cost: number | null;
};

export type PurchaseRequestFormDefaults = {
    request_no: string;
    supplier_id: number | null;
    project_id: number | null;
    work_order_id: number | null;
    request_date: string;
    status: string;
};

export type PurchaseRequestListItem = {
    id: number;
    request_no: string;
    request_date: string | null;
    needed_by: string | null;
    status: string;
    status_label: string;
    purpose: string;
    item_count: number;
    purchase_order_count: number;
    attachment_count: number;
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
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
        update: boolean;
        delete: boolean;
    };
};

export type PurchaseRequestLine = {
    id: number;
    inventory_item_id: number;
    item_description: string;
    unit: string;
    requested_quantity: number;
    estimated_unit_cost: number | null;
    remarks: string | null;
    inventory_item: {
        id: number | null;
        item_code: string | null;
        item_name: string | null;
        unit: string | null;
    };
};

export type PurchaseRequestPurchaseOrderSnippet = {
    id: number;
    po_no: string;
    status: string;
    status_label: string;
    order_date: string | null;
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
    };
    receipt_count: number;
    attachment_count: number;
    can: {
        view: boolean;
    };
};

export type PurchaseRequestDetail = {
    id: number;
    request_no: string;
    supplier_id: number | null;
    project_id: number | null;
    work_order_id: number | null;
    request_date: string | null;
    needed_by: string | null;
    status: string;
    status_label: string;
    purpose: string;
    remarks: string | null;
    item_count: number;
    purchase_order_count: number;
    attachment_count: number;
    requested_by: string | null;
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
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
    items?: PurchaseRequestLine[];
    purchase_orders?: PurchaseRequestPurchaseOrderSnippet[];
    attachments?: AttachmentItem[];
    can: {
        update: boolean;
        delete: boolean;
        create_purchase_order: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type PurchaseOrderFilters = {
    search: string;
    status: string;
    per_page: number;
};

export type PurchaseOrderRequestLinePreset = {
    purchase_request_item_id: number;
    inventory_item_id: number;
    ordered_quantity: number;
    unit_cost: number;
    remarks: string | null;
};

export type PurchaseOrderRequestOption = {
    value: number;
    label: string;
    supplier_id: number | null;
    project_id: number | null;
    work_order_id: number | null;
    items: PurchaseOrderRequestLinePreset[];
};

export type PurchaseOrderLineInput = {
    purchase_request_item_id: string;
    inventory_item_id: string;
    ordered_quantity: string;
    unit_cost: string;
    remarks: string;
};

export type PurchaseOrderFormDefaults = {
    po_no: string;
    purchase_request_id: number | null;
    supplier_id: number | null;
    project_id: number | null;
    work_order_id: number | null;
    order_date: string;
    status: string;
    items: PurchaseOrderRequestLinePreset[];
};

export type PurchaseOrderListItem = {
    id: number;
    po_no: string;
    order_date: string | null;
    expected_date: string | null;
    status: string;
    status_label: string;
    supplier_reference: string | null;
    receipt_count: number;
    attachment_count: number;
    ordered_quantity_total: number;
    received_quantity_total: number;
    approval_state: string;
    approval_state_label: string;
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
    };
    purchase_request: {
        id: number | null;
        request_no: string | null;
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
        update: boolean;
        delete: boolean;
        receive: boolean;
        submit: boolean;
        approve: boolean;
    };
};

export type PurchaseOrderLine = {
    id: number;
    purchase_request_item_id: number | null;
    inventory_item_id: number;
    item_description: string;
    unit: string;
    ordered_quantity: number;
    unit_cost: number;
    received_quantity_total: number;
    remaining_quantity: number;
    remarks: string | null;
    inventory_item: {
        id: number | null;
        item_code: string | null;
        item_name: string | null;
        unit: string | null;
    };
};

export type PurchaseOrderReceiptSnippet = {
    id: number;
    receipt_no: string;
    received_date: string | null;
    received_by: string | null;
    received_quantity_total: number;
    item_count: number;
    attachment_count: number;
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    can: {
        view: boolean;
    };
};

export type PurchaseOrderDetail = {
    id: number;
    po_no: string;
    purchase_request_id: number | null;
    supplier_id: number;
    project_id: number | null;
    work_order_id: number | null;
    order_date: string | null;
    expected_date: string | null;
    status: string;
    status_label: string;
    supplier_reference: string | null;
    remarks: string | null;
    ordered_by: string | null;
    approval_requested_at: string | null;
    approval_requested_by: string | null;
    approved_at: string | null;
    approved_by: string | null;
    approval_notes: string | null;
    approval_state: string;
    approval_state_label: string;
    receipt_count: number;
    attachment_count: number;
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
    };
    purchase_request: {
        id: number | null;
        request_no: string | null;
        purpose: string | null;
        status: string | null;
        status_label: string | null;
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
    items?: PurchaseOrderLine[];
    receipts?: PurchaseOrderReceiptSnippet[];
    attachments?: AttachmentItem[];
    can: {
        update: boolean;
        delete: boolean;
        receive: boolean;
        submit: boolean;
        approve: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type PurchaseReceiptFilters = {
    search: string;
    warehouse: number | null;
    per_page: number;
};

export type PurchaseReceiptFormDefaults = {
    receipt_no: string;
    received_date: string;
    supplier_reference: string | null;
};

export type PurchaseReceiptLineInput = {
    purchase_order_item_id: string;
    received_quantity: string;
    remarks: string;
};

export type PurchaseReceiptSourceOrder = {
    id: number;
    po_no: string;
    status: string;
    status_label: string;
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
    };
    items: Array<{
        purchase_order_item_id: number;
        inventory_item_id: number;
        item_description: string;
        unit: string;
        ordered_quantity: number;
        received_quantity_total: number;
        remaining_quantity: number;
        unit_cost: number;
        inventory_item: {
            id: number | null;
            item_code: string | null;
            item_name: string | null;
            unit: string | null;
        };
    }>;
};

export type PurchaseReceiptListItem = {
    id: number;
    receipt_no: string;
    received_date: string | null;
    supplier_reference: string | null;
    received_by: string | null;
    item_count: number;
    attachment_count: number;
    received_quantity_total: number;
    purchase_order: {
        id: number | null;
        po_no: string | null;
    };
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
    };
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    can: {
        view: boolean;
    };
};

export type PurchaseReceiptDetail = {
    id: number;
    receipt_no: string;
    purchase_order_id: number;
    warehouse_id: number;
    received_date: string | null;
    supplier_reference: string | null;
    remarks: string | null;
    received_by: string | null;
    item_count: number;
    attachment_count: number;
    purchase_order: {
        id: number | null;
        po_no: string | null;
        status: string | null;
        status_label: string | null;
    };
    supplier: {
        id: number | null;
        supplier_code: string | null;
        company_name: string | null;
    };
    purchase_request: {
        id: number | null;
        request_no: string | null;
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
    warehouse: {
        id: number | null;
        warehouse_code: string | null;
        warehouse_name: string | null;
    };
    attachments?: AttachmentItem[];
    items: Array<{
        id: number;
        received_quantity: number;
        unit_cost: number;
        remarks: string | null;
        inventory_item: {
            id: number | null;
            item_code: string | null;
            item_name: string | null;
            unit: string | null;
        };
        purchase_order_item: {
            id: number | null;
            ordered_quantity: number | null;
        };
    }>;
    can: {
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type PurchasingStatusOption = SelectOption;
