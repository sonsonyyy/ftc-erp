import type { SelectOption } from './customers';

export type WithholdingRecordListItem = {
    id: number;
    record_type: string;
    record_type_label: string;
    record_date: string | null;
    reference_no: string | null;
    subject_name: string;
    subject_tin: string | null;
    subject_identifier: string | null;
    base_amount: number;
    amount: number;
    source: {
        type: string;
        payroll_run_id: number | null;
        payroll_run_no: string | null;
        employee_id: number | null;
        employee_no: string | null;
    };
};

export type VatRecordListItem = {
    id: number;
    record_type: string;
    record_type_label: string;
    record_date: string | null;
    reference_no: string | null;
    counterparty_name: string;
    counterparty_tin: string | null;
    net_amount: number;
    vat_amount: number;
    gross_amount: number;
    source: {
        type: string;
        invoice_id: number | null;
        invoice_no: string | null;
        customer_id: number | null;
        customer_code: string | null;
    };
};

export type TaxReportRunItem = {
    id: number;
    source_record_type: string;
    line_type: string;
    line_type_label: string;
    record_date: string | null;
    reference_no: string | null;
    subject_name: string | null;
    subject_tin: string | null;
    base_amount: number;
    amount: number;
    vat_amount: number;
    gross_amount: number;
    payload: Record<string, unknown>;
};

export type TaxReportRunListItem = {
    id: number;
    report_no: string;
    report_type: string;
    report_type_label: string;
    period_from: string | null;
    period_to: string | null;
    generated_at: string | null;
    item_count: number;
    base_amount_total: number;
    amount_total: number;
    vat_amount_total: number;
    gross_amount_total: number;
    generated_by: string | null;
    can: {
        view: boolean;
        delete: boolean;
    };
};

export type TaxReportRunDetail = {
    id: number;
    report_no: string;
    report_type: string;
    report_type_label: string;
    period_from: string | null;
    period_to: string | null;
    generated_at: string | null;
    item_count: number;
    base_amount_total: number;
    amount_total: number;
    vat_amount_total: number;
    gross_amount_total: number;
    remarks: string | null;
    generated_by: string | null;
    items: TaxReportRunItem[];
    can: {
        delete: boolean;
    };
};

export type TaxReportRunFormDefaults = {
    report_type: string;
    period_from: string;
    period_to: string;
};

export type TaxSourceFilters = {
    search: string;
    type: string;
    from: string | null;
    to: string | null;
};

export type TaxReportRunFilters = {
    search: string;
    type: string;
    from: string | null;
    to: string | null;
};

export type TaxReportTypeOption = SelectOption;
