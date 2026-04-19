import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as sitesCreate, index as sitesIndex } from '@/routes/sites';
import { SiteForm } from '@/components/customers/site-form';
import type { SelectOption } from '@/types';

type Props = {
    customerOptions: SelectOption[];
    activityOptions: SelectOption[];
    defaults: {
        customer_id: number | null;
        is_active: boolean;
    };
};

export default function SitesCreate({ customerOptions, defaults }: Props) {
    return (
        <>
            <Head title="New site" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <SiteForm
                    customerOptions={customerOptions}
                    defaults={defaults}
                    title="New site"
                    description="Create the site record and manage linked attachments from the detail page after saving."
                    cancelHref={sitesIndex()}
                />
            </div>
        </>
    );
}

SitesCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Sites',
            href: sitesIndex(),
        },
        {
            title: 'New site',
            href: sitesCreate(),
        },
    ],
};
