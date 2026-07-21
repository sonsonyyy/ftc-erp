import { Head } from '@inertiajs/react';
import { SiteForm } from '@/components/customers/site-form';
import { dashboard } from '@/routes';
import { index as sitesIndex, show as sitesShow } from '@/routes/sites';
import type { SelectOption, SiteDetail } from '@/types';

type Props = {
    site: SiteDetail;
    customerOptions: SelectOption[];
    activityOptions: SelectOption[];
};

export default function SitesEdit({ site, customerOptions }: Props) {
    return (
        <>
            <Head title={`Edit ${site.site_name}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <SiteForm
                    site={site}
                    customerOptions={customerOptions}
                    title="Edit site"
                    description="Update the site record used by projects, service work orders, and future billing."
                    cancelHref={sitesShow(site.id)}
                />
            </div>
        </>
    );
}

SitesEdit.layout = {
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
            title: 'Edit site',
            href: sitesIndex(),
        },
    ],
};
