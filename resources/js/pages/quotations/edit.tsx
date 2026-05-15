import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as quotationsIndex,
    show as quotationsShow,
} from '@/routes/quotations';
import { QuotationForm } from '@/components/quotations/quotation-form';
import type {
    QuotationDetail,
    QuotationSiteOption,
    SelectOption,
} from '@/types';

type Props = {
    quotation: QuotationDetail;
    customerOptions: SelectOption[];
    siteOptions: QuotationSiteOption[];
    userOptions: SelectOption[];
};

export default function QuotationsEdit({
    quotation,
    customerOptions,
    siteOptions,
    userOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${quotation.quotation_no}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <QuotationForm
                    quotation={quotation}
                    customerOptions={customerOptions}
                    siteOptions={siteOptions}
                    userOptions={userOptions}
                    title={`Edit ${quotation.quotation_no}`}
                    description="Update the quotation record details."
                    cancelHref={quotationsShow(quotation.id)}
                />
            </div>
        </>
    );
}

QuotationsEdit.layout = {
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
            title: 'Edit quotation',
            href: quotationsIndex(),
        },
    ],
};
