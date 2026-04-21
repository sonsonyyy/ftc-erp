import type { AttachmentItem, SelectOption } from './customers';

export type ComplianceTemplateOption = {
    value: number;
    label: string;
    name: string;
    agency: string;
    category: string | null;
    description: string | null;
    default_recurrence_unit: string;
    default_reminder_days: number[];
};

export type ComplianceRecordFormDefaults = {
    record_no: string;
    compliance_template_id: number | null;
    title: string;
    agency: string;
    category: string;
    description: string;
    due_date: string | null;
    expiry_date: string | null;
    recurrence_unit: string;
    reminder_days: number[];
    assigned_user_id: number | null;
    status: string;
    notes: string;
};

export type ComplianceTaskItem = {
    id: number;
    title: string;
    due_date: string | null;
    status: string;
    status_label: string;
    completed_at: string | null;
    notes: string | null;
    assigned_user: {
        id: number;
        name: string;
    } | null;
};

export type ComplianceSubmissionItem = {
    id: number;
    reference_no: string;
    submitted_at: string | null;
    due_date_snapshot: string | null;
    expiry_date_snapshot: string | null;
    next_due_date: string | null;
    next_expiry_date: string | null;
    remarks: string | null;
    submitted_by: string | null;
    approved_at: string | null;
    approved_by: string | null;
    approval_notes: string | null;
    approval_state: string;
    approval_state_label: string;
    can: {
        approve: boolean;
    };
};

export type ComplianceRecordAlertItem = {
    id: number;
    alert_type: string;
    alert_type_label: string;
    deadline_type: string;
    scheduled_for: string | null;
    reference_date: string | null;
    days_before: number;
    message: string;
    acknowledged_at: string | null;
    acknowledged_by: string | null;
    can_acknowledge: boolean;
};

export type ComplianceRecentAlertItem = {
    id: number;
    alert_type_label: string;
    message: string;
    scheduled_for: string | null;
    record: {
        id: number;
        record_no: string;
        title: string;
    } | null;
};

export type ComplianceRecordListItem = {
    id: number;
    record_no: string;
    title: string;
    agency: string;
    category: string | null;
    due_date: string | null;
    expiry_date: string | null;
    next_deadline_type: string | null;
    next_deadline_date: string | null;
    status: string;
    status_label: string;
    assigned_user: string | null;
    submission_count: number;
    open_alert_count: number;
    attachment_count: number;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type ComplianceRecordDetail = {
    id: number;
    record_no: string;
    title: string;
    agency: string;
    category: string | null;
    description: string | null;
    due_date: string | null;
    expiry_date: string | null;
    next_deadline_type: string | null;
    next_deadline_date: string | null;
    recurrence_unit: string;
    recurrence_unit_label: string;
    reminder_days: number[];
    status: string;
    status_label: string;
    display_status: string;
    display_status_label: string;
    latest_submission_at: string | null;
    latest_submission_reference: string | null;
    notes: string | null;
    attachment_count: number;
    submission_count: number;
    task_count: number;
    open_alert_count: number;
    template: {
        id: number;
        name: string;
        agency: string;
    } | null;
    assigned_user: {
        id: number;
        name: string;
    } | null;
    tasks?: ComplianceTaskItem[];
    submissions?: ComplianceSubmissionItem[];
    alerts?: ComplianceRecordAlertItem[];
    attachments?: AttachmentItem[];
    can: {
        update: boolean;
        delete: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
        create_submission: boolean;
        create_task: boolean;
        approve_submission: boolean;
    };
};

export type ComplianceRecordFilters = {
    search: string;
    status: string;
    agency: string;
    assigned: number | null;
};

export type ComplianceSummary = {
    due_soon_count: number;
    for_renewal_count: number;
    overdue_count: number;
    expired_count: number;
    open_alert_count: number | null;
};

export type ComplianceAlertListItem = {
    id: number;
    alert_type: string;
    alert_type_label: string;
    deadline_type: string;
    scheduled_for: string | null;
    reference_date: string | null;
    days_before: number;
    message: string;
    acknowledged_at: string | null;
    acknowledged_by: string | null;
    record: {
        id: number;
        record_no: string;
        title: string;
        agency: string;
    } | null;
    can: {
        acknowledge: boolean;
    };
};

export type ComplianceAlertFilters = {
    search: string;
    type: string;
    acknowledged: string;
    agency: string;
};

export type ComplianceCalendarFilters = {
    agency: string;
    status: string;
    from: string;
    to: string;
};

export type ComplianceCalendarRecord = {
    id: number;
    record_no: string;
    title: string;
    agency: string;
    category: string | null;
    due_date: string | null;
    expiry_date: string | null;
    display_status: string;
    display_status_label: string;
    assigned_user: string | null;
};

export type ComplianceCalendarEvent = ComplianceCalendarRecord & {
    date: string;
    deadline_type: string;
    deadline_type_label: string;
};

export type ComplianceCalendarWindow = {
    from: string;
    to: string;
};

export type ComplianceStatusOption = SelectOption;
