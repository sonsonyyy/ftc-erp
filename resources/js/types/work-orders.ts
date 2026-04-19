import type { AttachmentItem, SelectOption } from './customers';

export type WorkOrderSiteOption = {
    value: number;
    label: string;
    customer_id: number;
};

export type WorkOrderQuotationOption = {
    value: number;
    label: string;
    customer_id: number;
    customer_site_id: number | null;
};

export type WorkOrderProjectOption = {
    value: number;
    label: string;
    customer_id: number;
    customer_site_id: number;
    quotation_id: number | null;
};

export type WorkOrderListItem = {
    id: number;
    work_order_no: string;
    summary: string;
    service_type: string;
    service_type_label: string;
    scheduled_date: string | null;
    priority: string;
    priority_label: string;
    status: string;
    status_label: string;
    attachment_count: number;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    site: {
        id: number | null;
        site_code: string | null;
        site_name: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
    };
    quotation: {
        id: number | null;
        quotation_no: string | null;
        subject: string | null;
    };
    can: {
        view: boolean;
        update: boolean;
        change_status: boolean;
        delete: boolean;
    };
};

export type WorkOrderAssignmentItem = {
    id: number;
    assignment_role: string | null;
    notes: string | null;
    assigned_at: string | null;
    user: {
        id: number | null;
        name: string | null;
    };
};

export type WorkOrderLogItem = {
    id: number;
    log_type: string;
    log_type_label: string;
    from_status: string | null;
    from_status_label: string | null;
    to_status: string | null;
    to_status_label: string | null;
    details: string | null;
    logged_at: string | null;
    logged_by: string | null;
};

export type WorkOrderMaterialItem = {
    id: number;
    item_code: string | null;
    item_name: string;
    quantity: number;
    unit: string | null;
    notes: string | null;
};

export type WorkOrderDetail = {
    id: number;
    quotation_id: number | null;
    project_id: number | null;
    customer_id: number;
    customer_site_id: number;
    work_order_no: string;
    service_type: string;
    service_type_label: string;
    scheduled_date: string | null;
    priority: string;
    priority_label: string;
    status: string;
    status_label: string;
    summary: string;
    findings: string | null;
    completion_date: string | null;
    attachment_count: number;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    site: {
        id: number | null;
        site_code: string | null;
        site_name: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
    };
    project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
        status: string | null;
        status_label: string | null;
    };
    quotation: {
        id: number | null;
        quotation_no: string | null;
        subject: string | null;
        status: string | null;
        status_label: string | null;
    };
    attachments?: AttachmentItem[];
    assignments?: WorkOrderAssignmentItem[];
    logs?: WorkOrderLogItem[];
    materials?: WorkOrderMaterialItem[];
    can: {
        update: boolean;
        change_status: boolean;
        delete: boolean;
        manage_assignments: boolean;
        manage_logs: boolean;
        manage_materials: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type WorkOrderFormDefaults = {
    customer_id: number | null;
    customer_site_id: number | null;
    quotation_id: number | null;
    project_id: number | null;
    priority: string;
    status: string;
    scheduled_date: string;
};

export type WorkOrderFilters = {
    search: string;
    customer: number | null;
    project: number | null;
    status: string;
    priority: string;
    service_type: string;
};

export type WorkOrderStatusOption = SelectOption;
