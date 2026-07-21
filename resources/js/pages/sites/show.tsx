import { Head, Link } from '@inertiajs/react';
import CustomerSiteController from '@/actions/App/Http/Controllers/Customers/CustomerSiteController';
import { RecordAttachmentsCard } from '@/components/attachments/record-attachments-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import { index as sitesIndex, edit as sitesEdit } from '@/routes/sites';
import type { SiteDetail } from '@/types';

type Props = {
    site: SiteDetail;
};

export default function SitesShow({ site }: Props) {
    return (
        <>
            <Head title={site.site_name} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {site.site_name}
                            </h1>
                            <Badge
                                variant="outline"
                                className={
                                    site.is_active
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-slate-100 text-slate-700'
                                }
                            >
                                {site.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {site.site_code ?? 'No site code'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {site.customer.id && (
                            <Button variant="outline" asChild>
                                <Link href={customersShow(site.customer.id)}>
                                    View customer
                                </Link>
                            </Button>
                        )}

                        {site.can.update && (
                            <Button asChild>
                                <Link href={sitesEdit(site.id)}>Edit site</Link>
                            </Button>
                        )}

                        {site.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={CustomerSiteController.destroy(
                                        site.id,
                                    )}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Site information</CardTitle>
                            <CardDescription>
                                Operational details used by projects and service
                                work.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Customer
                                </p>
                                {site.customer.id ? (
                                    <Link
                                        href={customersShow(site.customer.id)}
                                        className="mt-1 inline-flex font-medium hover:underline"
                                    >
                                        {site.customer.customer_code} -{' '}
                                        {site.customer.company_name}
                                    </Link>
                                ) : (
                                    <p className="mt-1 font-medium">Unlinked</p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Contact person
                                </p>
                                <p className="mt-1 font-medium">
                                    {site.contact_person ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Contact number
                                </p>
                                <p className="mt-1 font-medium">
                                    {site.contact_no ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="mt-1 font-medium">
                                    {site.email ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Address
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {site.address}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    City / Municipality
                                </p>
                                <p className="mt-1 font-medium">
                                    {site.city ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Province
                                </p>
                                <p className="mt-1 font-medium">
                                    {site.province ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Notes
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {site.notes ?? 'No notes'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{site.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <RecordAttachmentsCard
                    attachments={site.attachments ?? []}
                    attachableType="site"
                    attachableId={site.id}
                    canUpload={site.can.upload_attachments}
                    canUnlink={site.can.remove_attachments}
                />
            </div>
        </>
    );
}

SitesShow.layout = {
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
            title: 'Site details',
            href: sitesIndex(),
        },
    ],
};
