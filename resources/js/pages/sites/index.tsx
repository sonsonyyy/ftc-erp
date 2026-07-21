import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import {
    create as sitesCreate,
    destroy as sitesDestroy,
    edit as sitesEdit,
    index as sitesIndex,
    show as sitesShow,
} from '@/routes/sites';
import type { PaginatedData, SelectOption, SiteListItem } from '@/types';

type Props = {
    sites: PaginatedData<SiteListItem>;
    filters: {
        search: string;
        status: string;
        per_page: number;
    };
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const siteBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Sites',
        href: sitesIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function statusBadgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function SitesIndex({
    sites,
    filters,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setTableFilters((currentFilters) => {
                const nextFilters = {
                    status: filters.status,
                    per_page: String(filters.per_page),
                };

                if (
                    currentFilters.status === nextFilters.status &&
                    currentFilters.per_page === nextFilters.per_page
                ) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.status === filters.status &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(sitesIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['sites', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.per_page,
        filters.search,
        filters.status,
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Sites" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sites
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Project and service locations by customer.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search sites or customers"
                        />

                        <FilterSelect
                            value={tableFilters.status}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    status: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[180px]"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>

                    {can.create ? (
                        <Button asChild className="lg:shrink-0">
                            <Link href={sitesCreate()}>
                                <Plus />
                                New site
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={sites}
                            perPage={tableFilters.per_page}
                            perPageOptions={perPageOptions}
                            onPerPageChange={(value) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    per_page: value,
                                }));
                            }}
                        />
                    }
                >
                    <table>
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Site / contact person</th>
                                <th>Customer</th>
                                <th>Mobile / email</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sites.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No sites matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {sites.data.map((site) => (
                                <tr key={site.id}>
                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[10rem] truncate">
                                            {site.site_code ?? 'No site code'}
                                        </p>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {site.site_name}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {site.contact_person ??
                                                    'Not set'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            {site.customer.id ? (
                                                <Link
                                                    href={customersShow(
                                                        site.customer.id,
                                                    )}
                                                    className="block max-w-[16rem] truncate font-medium text-foreground hover:underline"
                                                >
                                                    {site.customer.company_name}
                                                </Link>
                                            ) : (
                                                <p className="max-w-[16rem] truncate font-medium text-muted-foreground">
                                                    Unlinked
                                                </p>
                                            )}
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {site.customer.customer_code ??
                                                    'No customer code'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5 text-[13px] leading-5 text-muted-foreground">
                                            {site.contact_no && (
                                                <p className="max-w-[15rem] truncate">
                                                    {site.contact_no}
                                                </p>
                                            )}
                                            {site.email && (
                                                <p className="max-w-[15rem] truncate">
                                                    {site.email}
                                                </p>
                                            )}
                                            {!site.contact_no &&
                                                !site.email && (
                                                    <p className="max-w-[15rem] truncate">
                                                        No contact details
                                                    </p>
                                                )}
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[14rem] truncate">
                                            {[site.city, site.province]
                                                .filter(Boolean)
                                                .join(', ') || 'Not set'}
                                        </p>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                site.is_active,
                                            )}
                                        >
                                            {site.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {site.attachment_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="site"
                                                items={[
                                                    ...(site.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: sitesShow(
                                                                      site.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(site.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: sitesEdit(
                                                                      site.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(site.can.delete
                                                        ? [
                                                              {
                                                                  key: 'archive',
                                                                  label: 'Archive',
                                                                  icon: Archive,
                                                                  destructive: true,
                                                                  onSelect:
                                                                      () =>
                                                                          router.delete(
                                                                              toUrl(
                                                                                  sitesDestroy(
                                                                                      site.id,
                                                                                  ),
                                                                              ),
                                                                              {
                                                                                  preserveScroll: true,
                                                                              },
                                                                          ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${site.site_name}`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CompactDataTable>
            </div>
        </>
    );
}

SitesIndex.layout = {
    breadcrumbs: siteBreadcrumbs,
};
