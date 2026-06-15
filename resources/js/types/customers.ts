export type SelectOption = {
    value: number | string;
    label: string;
};

export type AttachmentItem = {
    id: number;
    original_name: string;
    mime_type: string | null;
    extension: string | null;
    file_size: number;
    uploaded_at: string | null;
    uploaded_by: string | null;
    download_url: string;
};

export type CustomerListItem = {
    id: number;
    customer_code: string;
    company_name: string;
    trade_name: string | null;
    tin: string | null;
    phone: string | null;
    email: string | null;
    status: string;
    status_label: string;
    site_count: number;
    attachment_count: number;
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type CustomerSiteSnippet = {
    id: number;
    site_code: string;
    site_name: string;
    city: string | null;
    province: string | null;
    is_active: boolean;
    attachment_count: number;
    can: {
        view: boolean;
        update: boolean;
    };
};

export type CustomerDetail = {
    id: number;
    customer_code: string;
    company_name: string;
    trade_name: string | null;
    tin: string | null;
    phone: string | null;
    email: string | null;
    billing_address: string | null;
    status: string;
    status_label: string;
    notes: string | null;
    site_count: number;
    attachment_count: number;
    attachments?: AttachmentItem[];
    sites?: CustomerSiteSnippet[];
    can: {
        update: boolean;
        delete: boolean;
        create_site: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};

export type SiteListItem = {
    id: number;
    site_code: string;
    site_name: string;
    contact_person: string | null;
    contact_no: string | null;
    email: string | null;
    city: string | null;
    province: string | null;
    is_active: boolean;
    attachment_count: number;
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    can: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type SiteDetail = {
    id: number;
    customer_id: number;
    site_code: string;
    site_name: string;
    contact_person: string | null;
    contact_no: string | null;
    email: string | null;
    address: string;
    city: string | null;
    province: string | null;
    notes: string | null;
    is_active: boolean;
    attachment_count: number;
    attachments?: AttachmentItem[];
    customer: {
        id: number | null;
        customer_code: string | null;
        company_name: string | null;
    };
    can: {
        update: boolean;
        delete: boolean;
        upload_attachments: boolean;
        remove_attachments: boolean;
    };
};
