import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as sitesCreate,
    index as sitesIndex,
    show as sitesShow,
    edit as sitesEdit,
} from '@/routes/sites';
import { show as customersShow } from '@/routes/customers';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { countActiveFilters } from '@/lib/utils';
import type { PaginatedData, SelectOption, SiteListItem } from '@/types';

type Props = {
    sites: PaginatedData<SiteListItem>;
    filters: {
        search: string;
        customer: number | null;
        active: string;
    };
    customerOptions: SelectOption[];
    activityOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

export default function SitesIndex({
    sites,
    filters,
    customerOptions,
    activityOptions,
    can,
}: Props) {
    const activeFilterCount = countActiveFilters(filters);

    return (
        <>
            <Head title="Sites" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Sites
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track project and service locations under each
                            customer account.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={sitesCreate()}>New site</Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={sitesIndex()}
                    resetHref={sitesIndex()}
                    description="Search by site code, site name, location, contact details, or customer."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="md:grid-cols-[2fr_1.2fr_1fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search sites"
                    />

                    <FilterSelect
                        name="customer"
                        defaultValue={
                            filters.customer ? String(filters.customer) : ''
                        }
                    >
                        <option value="">All customers</option>
                        {customerOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect name="active" defaultValue={filters.active}>
                        <option value="">All activity</option>
                        {activityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Site list</CardTitle>
                        <CardDescription>
                            {sites.total} total site records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Site
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sites.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No sites matched the current
                                            filters.
                                        </td>
                                    </tr>
                                )}

                                {sites.data.map((site) => (
                                    <tr
                                        key={site.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {site.site_name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {site.site_code ??
                                                        'No site code'}
                                                    {site.contact_person &&
                                                        ` • ${site.contact_person}`}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {site.customer.id ? (
                                                <Link
                                                    href={customersShow(
                                                        site.customer.id,
                                                    )}
                                                    className="font-medium hover:underline"
                                                >
                                                    {site.customer.company_name}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Unlinked
                                                </span>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                {site.customer.customer_code ??
                                                    ''}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {[site.city, site.province]
                                                .filter(Boolean)
                                                .join(', ') || 'Not set'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    site.is_active
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-200 bg-slate-100 text-slate-700'
                                                }
                                            >
                                                {site.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {site.can.view && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={sitesShow(
                                                                site.id,
                                                            )}
                                                        >
                                                            Open
                                                        </Link>
                                                    </Button>
                                                )}

                                                {site.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={sitesEdit(
                                                                site.id,
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={sites} />
                </Card>
            </div>
        </>
    );
}

SitesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Sites',
            href: sitesIndex(),
        },
    ],
};
