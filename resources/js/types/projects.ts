import type { AttachmentItem, SelectOption } from './customers';

export type ProjectSiteOption = {
    value: number;
    label: string;
    customer_id: number;
};

export type ProjectQuotationOption = {
    value: number;
    label: string;
    customer_id: number;
    customer_site_id: number | null;
};

export type ProjectListItem = {
    id: number;
    project_no: string;
    title: string;
    project_type: string;
    start_date: string | null;
    target_end_date: string | null;
    status: string;
    status_label: string;
    attachment_count: number;
    work_order_count: number;
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

export type ProjectStatusHistoryItem = {
    id: number;
    from_status: string | null;
    from_status_label: string | null;
    to_status: string | null;
    to_status_label: string | null;
    remarks: string | null;
    changed_at: string | null;
    changed_by: string | null;
};

export type ProjectAssignmentItem = {
    id: number;
    assignment_role: string | null;
    notes: string | null;
    assigned_at: string | null;
    user: {
        id: number | null;
        name: string | null;
    };
};

export type ProjectWorkOrderSnippet = {
    id: number;
    work_order_no: string;
    summary: string;
    status: string;
    status_label: string;
    scheduled_date: string | null;
    can: {
        view: boolean;
    };
};

export type ProjectDetail = {
    id: number;
    quotation_id: number | null;
    customer_id: number;
    customer_site_id: number;
    project_no: string;
    title: string;
    project_type: string;
    start_date: string | null;
    target_end_date: string | null;
    actual_end_date: string | null;
    status: string;
    status_label: string;
    description: string | null;
    attachment_count: number;
    work_order_count: number;
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
    quotation: {
        id: number | null;
        quotation_no: string | null;
        subject: string | null;
        status: string | null;
        status_label: string | null;
    };
    attachments?: AttachmentItem[];
    status_history?: ProjectStatusHistoryItem[];
    assignments?: ProjectAssignmentItem[];
    work_orders?: ProjectWorkOrderSnippet[];
    can: {
        update: boolean;
        change_status: boolean;
        delete: boolean;
        manage_assignments: boolean;
        create_work_order: boolean;
        create_stock_issuance: boolean;
        create_stock_return: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type ProjectFormDefaults = {
    customer_id: number | null;
    customer_site_id: number | null;
    quotation_id: number | null;
    title?: string | null;
    description?: string | null;
    status: string;
    start_date: string;
};

export type ProjectFilters = {
    search: string;
    customer: number | null;
    status: string;
    per_page: number;
};

export type ProjectIndexSummary = {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    linked_work_orders: number;
};

export type ProjectStatusOption = SelectOption;
