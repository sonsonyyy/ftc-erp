import type { AttachmentItem, SelectOption } from './customers';

export type QuotationSiteOption = {
    value: number;
    label: string;
    customer_id: number;
};

export type QuotationListItem = {
    id: number;
    quotation_no: string;
    subject: string;
    quotation_date: string | null;
    valid_until: string | null;
    quotation_amount: number;
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
    assigned_sales_user: string | null;
    can: {
        view: boolean;
        update: boolean;
        change_status: boolean;
        delete: boolean;
    };
};

export type QuotationStatusHistoryItem = {
    id: number;
    from_status: string | null;
    from_status_label: string | null;
    to_status: string;
    to_status_label: string;
    remarks: string | null;
    changed_at: string | null;
    changed_by: string | null;
};

export type QuotationDetail = {
    id: number;
    quotation_no: string;
    customer_id: number;
    customer_site_id: number | null;
    subject: string;
    quotation_date: string | null;
    valid_until: string | null;
    quotation_amount: number;
    status: string;
    status_label: string;
    prepared_by_user_id: number | null;
    assigned_sales_user_id: number | null;
    materialized_at: string | null;
    lost_reason: string | null;
    remarks: string | null;
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
    prepared_by: {
        id: number | null;
        name: string | null;
    };
    assigned_sales_user: {
        id: number | null;
        name: string | null;
    };
    converted_project: {
        id: number | null;
        project_no: string | null;
        title: string | null;
        status: string | null;
        status_label: string | null;
    };
    converted_work_order: {
        id: number | null;
        work_order_no: string | null;
        summary: string | null;
        status: string | null;
        status_label: string | null;
    };
    attachments?: AttachmentItem[];
    status_history?: QuotationStatusHistoryItem[];
    can: {
        update: boolean;
        change_status: boolean;
        delete: boolean;
        convert_to_project: boolean;
        convert_to_work_order: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type QuotationKpiMetrics = {
    total_submitted: number;
    total_awarded: number;
    conversion_rate: number;
    total_quotation_value: number;
    awarded_value: number;
    value_conversion_rate: number;
    pending_count: number;
    lost_count: number;
    average_days_to_materialize: number | null;
};

export type QuotationIndexSummary = {
    total_quotations: number;
    pending_quotations: number;
    awarded_quotations: number;
    total_quotation_value: number;
};

export type QuotationStatusBreakdownItem = {
    status: string;
    label: string;
    count: number;
};

export type QuotationCustomerKpiItem = {
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    quotation_count: number;
    total_value: number;
};

export type QuotationLostReasonItem = {
    lost_reason: string;
    lost_count: number;
};

export type QuotationFormDefaults = {
    customer_id: number | null;
    customer_site_id: number | null;
    status: string;
    quotation_date: string;
};

export type QuotationFilters = {
    search: string;
    customer: number | null;
    status: string;
    from: string | null;
    to: string | null;
    per_page: number;
};

export type QuotationKpiFilters = {
    customer: number | null;
    range: string;
    from: string | null;
    to: string | null;
};

export type QuotationStatusOption = SelectOption;
