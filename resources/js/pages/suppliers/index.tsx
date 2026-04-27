import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as suppliersCreate,
    edit as suppliersEdit,
    index as suppliersIndex,
    show as suppliersShow,
} from '@/routes/suppliers';
import type {
    PaginatedData,
    SelectOption,
    SupplierFilters,
    SupplierListItem,
} from '@/types';

type Props = {
    suppliers: PaginatedData<SupplierListItem>;
    filters: SupplierFilters;
    activityOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const supplierBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Suppliers',
        href: suppliersIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function badgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function SuppliersIndex({
    suppliers,
    filters,
    activityOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        activity: filters.activity,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                activity: filters.activity,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.activity === nextFilters.activity &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.activity, filters.per_page]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.activity === filters.activity &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(suppliersIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    activity: tableFilters.activity,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['suppliers', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.activity,
        filters.per_page,
        filters.search,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount = tableFilters.activity === '' ? 0 : 1;

    return (
        <>
            <Head title="Suppliers" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Suppliers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Supplier records for purchasing and receiving.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={suppliersCreate()}>
                                <Plus />
                                New supplier
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search suppliers"
                                className="h-9 pl-9"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 bg-background"
                                >
                                    <SlidersHorizontal />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.activity === ''
                                            ? 'all'
                                            : tableFilters.activity
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            activity:
                                                value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All suppliers
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuSeparator />
                                    {activityOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={suppliers}
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
                                <th>Supplier</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th className="text-right">Linked docs</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {suppliers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No suppliers matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {suppliers.data.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {supplier.company_name}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    supplier.supplier_code,
                                                    supplier.payment_terms,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    supplier.supplier_code}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-medium text-foreground">
                                                {supplier.contact_person ??
                                                    'No contact person'}
                                            </p>
                                            <p className="max-w-[16rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    supplier.phone,
                                                    supplier.email,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No phone or email'}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={badgeClass(
                                                supplier.is_active,
                                            )}
                                        >
                                            {supplier.activity_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right text-[13px] text-muted-foreground">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {supplier.purchase_request_count}{' '}
                                            requests
                                        </p>
                                        <p>
                                            {supplier.purchase_order_count}{' '}
                                            orders
                                        </p>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {supplier.attachment_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(supplier.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: suppliersShow(
                                                                      supplier.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(supplier.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: suppliersEdit(
                                                                      supplier.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${supplier.company_name}`}
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

SuppliersIndex.layout = {
    breadcrumbs: supplierBreadcrumbs,
};
