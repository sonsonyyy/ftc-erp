import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as quotationsIndex } from '@/routes/quotations';
import { QuotationForm } from '@/components/quotations/quotation-form';
import type {
    QuotationFormDefaults,
    QuotationSiteOption,
    SelectOption,
} from '@/types';

type Props = {
    customerOptions: SelectOption[];
    siteOptions: QuotationSiteOption[];
    userOptions: SelectOption[];
    statusOptions: SelectOption[];
    defaults: QuotationFormDefaults;
};

export default function QuotationsCreate({
    customerOptions,
    siteOptions,
    userOptions,
    statusOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Quotation" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <QuotationForm
                    customerOptions={customerOptions}
                    siteOptions={siteOptions}
                    userOptions={userOptions}
                    statusOptions={statusOptions}
                    defaults={defaults}
                    title="New quotation"
                    description="Capture a quotation record for tracking and handoff."
                    cancelHref={quotationsIndex()}
                />
            </div>
        </>
    );
}

QuotationsCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Quotations',
            href: quotationsIndex(),
        },
        {
            title: 'New quotation',
            href: quotationsIndex(),
        },
    ],
};
