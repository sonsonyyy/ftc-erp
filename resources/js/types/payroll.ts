import type { SelectOption } from './customers';

export type DepartmentListItem = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    position_count: number;
    employee_count: number;
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type DepartmentDetail = {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    position_count: number;
    employee_count: number;
    can: {
        delete: boolean;
    };
};

export type PositionOption = SelectOption & {
    department_id: number | null;
};

export type PositionListItem = {
    id: number;
    title: string;
    description: string | null;
    is_active: boolean;
    employee_count: number;
    department: {
        id: number | null;
        name: string | null;
    };
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type PositionDetail = {
    id: number;
    department_id: number | null;
    title: string;
    description: string | null;
    is_active: boolean;
    employee_count: number;
    department: {
        id: number | null;
        name: string | null;
    };
    can: {
        delete: boolean;
    };
};

export type EmployeeListItem = {
    id: number;
    employee_no: string;
    full_name: string;
    employment_status: string;
    employment_status_label: string;
    hire_date: string | null;
    basic_salary: number | null;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    payroll_entry_count: number;
    department: {
        id: number | null;
        name: string | null;
    };
    position: {
        id: number | null;
        title: string | null;
    };
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type EmployeePayrollHistoryItem = {
    id: number;
    gross_pay: number;
    total_deductions: number;
    net_pay: number;
    payroll_run: {
        id: number | null;
        payroll_run_no: string | null;
        payroll_date: string | null;
        status: string | null;
        status_label: string | null;
    };
};

export type EmployeeDetail = {
    id: number;
    employee_no: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    full_name: string;
    department_id: number | null;
    position_id: number | null;
    employment_status: string;
    employment_status_label: string;
    hire_date: string | null;
    basic_salary: number | null;
    tin: string | null;
    sss_no: string | null;
    pagibig_no: string | null;
    philhealth_no: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
    payroll_entry_count: number;
    department: {
        id: number | null;
        name: string | null;
    };
    position: {
        id: number | null;
        title: string | null;
    };
    payroll_history?: EmployeePayrollHistoryItem[];
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type EmployeeFormDefaults = {
    employee_no: string;
    employment_status: string;
    is_active: boolean;
};

export type PayrollEmployeeOption = {
    value: number;
    label: string;
    basic_salary: number | null;
    department_name: string | null;
    position_title: string | null;
};

export type PayrollRunListItem = {
    id: number;
    payroll_run_no: string;
    period_from: string | null;
    period_to: string | null;
    payroll_date: string | null;
    status: string;
    status_label: string;
    gross_total: number;
    total_deductions: number;
    net_total: number;
    entry_count: number;
    prepared_by: string | null;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type PayrollRunDeductionDetail = {
    id: number;
    deduction_name: string;
    amount: number;
    remarks: string | null;
};

export type PayrollRunEntryDetail = {
    id: number;
    employee_id: number;
    gross_pay: number;
    tax_amount: number;
    sss_amount: number;
    pagibig_amount: number;
    philhealth_amount: number;
    other_deductions_amount: number;
    total_deductions: number;
    net_pay: number;
    remarks: string | null;
    employee: {
        id: number | null;
        employee_no: string | null;
        full_name: string | null;
        department_name: string | null;
        position_title: string | null;
    };
    deductions: PayrollRunDeductionDetail[];
};

export type PayrollRunDetail = {
    id: number;
    payroll_run_no: string;
    period_from: string | null;
    period_to: string | null;
    payroll_date: string | null;
    status: string;
    status_label: string;
    gross_total: number;
    total_deductions: number;
    net_total: number;
    remarks: string | null;
    entry_count: number;
    prepared_by: string | null;
    entries: PayrollRunEntryDetail[];
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type PayrollRunFormDefaults = {
    payroll_run_no: string;
    period_from: string;
    period_to: string;
    payroll_date: string;
    status: string;
};
