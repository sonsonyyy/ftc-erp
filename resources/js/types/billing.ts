import type { AttachmentItem, SelectOption } from './customers';

export type InvoiceFilters = {
    search: string;
    customer: number | null;
    status: string;
    from: string | null;
    to: string | null;
    per_page: number;
};

export type BillingQuotationOption = {
    value: number;
    label: string;
    customer_id: number | null;
};

export type BillingProjectOption = {
    value: number;
    label: string;
    customer_id: number | null;
    quotation_id: number | null;
};

export type BillingWorkOrderOption = {
    value: number;
    label: string;
    customer_id: number | null;
    project_id: number | null;
    quotation_id: number | null;
};

export type InvoiceLineInput = {
    description: string;
    unit: string;
    quantity: string;
    unit_price: string;
    remarks: string;
};

export type InvoiceFormDefaults = {
    invoice_no: string;
    quotation_id: number | null;
    customer_id: number | null;
    project_id: number | null;
    work_order_id: number | null;
    invoice_date: string;
    due_date: string | null;
    tax_amount: number;
    status: string;
};

export type InvoiceListItem = {
    id: number;
    invoice_no: string;
    invoice_date: string | null;
    due_date: string | null;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    balance_amount: number;
    paid_amount: number;
    status: string;
    status_label: string;
    approval_state: string;
    approval_state_label: string;
    attachment_count: number;
    payment_count: number;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    quotation: {
        id: number | null;
        quotation_no: string | null;
        subject: string | null;
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
        record_payment: boolean;
        submit: boolean;
        approve: boolean;
    };
};

export type InvoiceLine = {
    id: number;
    description: string;
    unit: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
    remarks: string | null;
};

export type InvoicePaymentSnippet = {
    id: number;
    payment_no: string | null;
    payment_date: string | null;
    payment_method: string | null;
    reference_no: string | null;
    allocated_amount: number;
    can: {
        view: boolean;
    };
};

export type InvoiceDetail = {
    id: number;
    invoice_no: string;
    quotation_id: number | null;
    customer_id: number;
    project_id: number | null;
    work_order_id: number | null;
    invoice_date: string | null;
    due_date: string | null;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    balance_amount: number;
    paid_amount: number;
    status: string;
    status_label: string;
    stored_status: string;
    stored_status_label: string;
    approval_requested_at: string | null;
    approval_requested_by: string | null;
    approved_at: string | null;
    approved_by: string | null;
    approval_notes: string | null;
    approval_state: string;
    approval_state_label: string;
    remarks: string | null;
    issued_by: string | null;
    attachment_count: number;
    payment_count: number;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    quotation: {
        id: number | null;
        quotation_no: string | null;
        subject: string | null;
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
    items?: InvoiceLine[];
    payments?: InvoicePaymentSnippet[];
    attachments?: AttachmentItem[];
    can: {
        update: boolean;
        delete: boolean;
        record_payment: boolean;
        submit: boolean;
        approve: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type PaymentFilters = {
    search: string;
    customer: number | null;
    from: string | null;
    to: string | null;
    per_page: number;
};

export type PaymentInvoiceOption = {
    value: number;
    label: string;
    customer_id: number | null;
    remaining_balance: number;
    invoice_date: string | null;
    due_date: string | null;
    status: string;
    status_label: string;
};

export type PaymentMethodOption = SelectOption;

export type PaymentAllocationInput = {
    invoice_id: string;
    allocated_amount: string;
};

export type PaymentFormDefaults = {
    payment_no: string;
    customer_id: number | null;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_no: string;
    remarks: string;
    allocations: Array<{
        invoice_id: number;
        allocated_amount: number;
    }>;
};

export type PaymentListItem = {
    id: number;
    payment_no: string;
    payment_date: string | null;
    amount: number;
    payment_method: string;
    reference_no: string | null;
    allocation_count: number;
    recorded_by: string | null;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    can: {
        view: boolean;
    };
};

export type PaymentDetail = {
    id: number;
    payment_no: string;
    customer_id: number;
    payment_date: string | null;
    amount: number;
    payment_method: string;
    reference_no: string | null;
    remarks: string | null;
    allocation_count: number;
    recorded_by: string | null;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    allocations: Array<{
        id: number;
        allocated_amount: number;
        invoice: {
            id: number | null;
            invoice_no: string | null;
            invoice_date: string | null;
            due_date: string | null;
            total_amount: number;
            balance_amount: number;
            status: string | null;
            status_label: string | null;
            quotation: {
                id: number | null;
                quotation_no: string | null;
                subject: string | null;
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
        };
        can: {
            view_invoice: boolean;
        };
    }>;
};

export type AccountsReceivableSummary = {
    total_outstanding: number;
    current_balance: number;
    overdue_balance: number;
    partially_paid_balance: number;
    paid_invoice_count: number;
    paid_invoice_value: number;
    bucket_totals: {
        current: number;
        days_1_30: number;
        days_31_60: number;
        days_61_90: number;
        days_91_plus: number;
    };
};

export type AccountsReceivableRow = {
    id: number;
    invoice_no: string;
    invoice_date: string | null;
    due_date: string | null;
    total_amount: number;
    balance_amount: number;
    paid_amount: number;
    age_days: number | null;
    aging_bucket: string;
    status: string;
    status_label: string;
    customer: {
        id: number | null;
        customer_code: string | null;
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
};
