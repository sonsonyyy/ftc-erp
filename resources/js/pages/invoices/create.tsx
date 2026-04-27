import { dashboard } from '@/routes';
import { index as invoicesIndex } from '@/routes/invoices';
import { InvoiceForm } from '@/components/billing/invoice-form';
import type {
    BillingProjectOption,
    BillingQuotationOption,
    BillingWorkOrderOption,
    InvoiceFormDefaults,
    SelectOption,
} from '@/types';

type Props = {
    customerOptions: SelectOption[];
    quotationOptions: BillingQuotationOption[];
    projectOptions: BillingProjectOption[];
    workOrderOptions: BillingWorkOrderOption[];
    statusOptions: SelectOption[];
    defaults: InvoiceFormDefaults;
};

export default function InvoicesCreate(props: Props) {
    return (
        <div className="app-page flex flex-1 flex-col gap-6">
            <InvoiceForm
                {...props}
                title="New Invoice"
                description="Create a billing record and link it to the relevant customer, quotation, project, or work order."
                cancelHref={invoicesIndex()}
            />
        </div>
    );
}

InvoicesCreate.layout = {
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
            title: 'New Invoice',
            href: invoicesIndex(),
        },
    ],
};
