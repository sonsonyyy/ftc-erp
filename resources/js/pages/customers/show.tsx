import { Head, Link } from '@inertiajs/react';
import CustomerController from '@/actions/App/Http/Controllers/Customers/CustomerController';
import { dashboard } from '@/routes';
import { index as customersIndex, edit as customersEdit } from '@/routes/customers';
import { create as sitesCreate, index as sitesIndex, show as sitesShow, edit as sitesEdit } from '@/routes/sites';
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
import type { CustomerDetail } from '@/types';

type Props = {
    customer: CustomerDetail;
};

function statusBadgeClass(status: string): string {
    return status === 'active'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function CustomersShow({ customer }: Props) {
    const sites = customer.sites ?? [];
    const attachments = customer.attachments ?? [];

    return (
        <>
            <Head title={customer.company_name} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {customer.company_name}
                            </h1>
                            <Badge
                                variant="outline"
                                className={statusBadgeClass(customer.status)}
                            >
                                {customer.status_label}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {customer.customer_code}
                            {customer.trade_name &&
                                ` • trade name: ${customer.trade_name}`}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {customer.can.create_site && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={sitesCreate({
                                        query: { customer: customer.id },
                                    })}
                                >
                                    New site
                                </Link>
                            </Button>
                        )}

                        {customer.can.update && (
                            <Button asChild>
                                <Link href={customersEdit(customer.id)}>Edit customer</Link>
                            </Button>
                        )}

                        {customer.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={CustomerController.destroy(customer.id)}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Linked sites</CardDescription>
                            <CardTitle>{customer.site_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Attachments</CardDescription>
                            <CardTitle>{customer.attachment_count}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>TIN</CardDescription>
                            <CardTitle className="text-base">
                                {customer.tin ?? 'Not set'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer information</CardTitle>
                            <CardDescription>
                                Master record details used by future quotations, projects, and billing.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="mt-1 font-medium">
                                    {customer.phone ?? 'Not set'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="mt-1 font-medium">
                                    {customer.email ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Billing address
                                </p>
                                <p className="mt-1 whitespace-pre-line font-medium">
                                    {customer.billing_address ?? 'Not set'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Notes</p>
                                <p className="mt-1 whitespace-pre-line font-medium">
                                    {customer.notes ?? 'No notes'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer sites</CardTitle>
                            <CardDescription>
                                Active project and service locations linked to this customer.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {sites.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No sites linked yet.
                                </div>
                            )}

                            {sites.map((site) => (
                                <div
                                    key={site.id}
                                    className="flex flex-col gap-3 rounded-lg border px-4 py-3"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {site.site_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {site.site_code ?? 'No site code'}
                                                {(site.city || site.province) &&
                                                    ` • ${[site.city, site.province]
                                                        .filter(Boolean)
                                                        .join(', ')}`}
                                            </p>
                                        </div>

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

                                    <div className="flex flex-wrap gap-2">
                                        {site.can.view && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={sitesShow(site.id)}>
                                                    Open
                                                </Link>
                                            </Button>
                                        )}

                                        {site.can.update && (
                                            <Button size="sm" asChild>
                                                <Link href={sitesEdit(site.id)}>
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {sites.length > 0 && (
                                <Button variant="outline" asChild>
                                    <Link
                                        href={sitesIndex({
                                            query: { customer: customer.id },
                                        })}
                                    >
                                        View all customer sites
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <RecordAttachmentsCard
                    attachments={attachments}
                    attachableType="customer"
                    attachableId={customer.id}
                    canUpload={customer.can.upload_attachments}
                    canUnlink={customer.can.remove_attachments}
                />
            </div>
        </>
    );
}

CustomersShow.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Customers',
            href: customersIndex(),
        },
        {
            title: 'Customer details',
            href: customersIndex(),
        },
    ],
};
