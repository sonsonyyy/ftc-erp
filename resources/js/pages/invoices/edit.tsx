import { dashboard } from '@/routes';
import {
    index as invoicesIndex,
    show as invoicesShow,
} from '@/routes/invoices';
import { InvoiceForm } from '@/components/billing/invoice-form';
import type {
    BillingProjectOption,
    BillingQuotationOption,
    BillingWorkOrderOption,
    InvoiceDetail,
    SelectOption,
} from '@/types';

type Props = {
    invoice: InvoiceDetail;
    customerOptions: SelectOption[];
    quotationOptions: BillingQuotationOption[];
    projectOptions: BillingProjectOption[];
    workOrderOptions: BillingWorkOrderOption[];
    statusOptions: SelectOption[];
};

export default function InvoicesEdit(props: Props) {
    return (
        <div className="app-page flex flex-1 flex-col gap-6">
            <InvoiceForm
                {...props}
                title="Edit Invoice"
                description="Update billing details before payments are posted."
                cancelHref={invoicesShow(props.invoice.id)}
            />
        </div>
    );
}

InvoicesEdit.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Invoices',
            href: invoicesIndex(),
        },
        {
            title: page.invoice.invoice_no,
            href: invoicesShow(page.invoice.id),
        },
        {
            title: 'Edit',
            href: invoicesShow(page.invoice.id),
        },
    ],
});
