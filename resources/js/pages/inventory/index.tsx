import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    Building2,
    Eye,
    Package,
    Pencil,
    Plus,
    TriangleAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as inventoryCreate,
    destroy as inventoryDestroy,
    edit as inventoryEdit,
    index as inventoryIndex,
    show as inventoryShow,
} from '@/routes/inventory';
import type {
    InventoryFilters,
    InventoryListItem,
    InventorySummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    inventoryItems: PaginatedData<InventoryListItem>;
    filters: InventoryFilters;
    categoryOptions: SelectOption[];
    statusOptions: SelectOption[];
    summary: InventorySummary;
    can: {
        create: boolean;
    };
};

const inventoryBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Inventory Items',
        href: inventoryIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

function formatCurrency(amount: number | null): string {
    if (amount === null) {
        return 'Not set';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function statusBadgeClass(status: string): string {
    return (
        {
            active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            inactive: 'border-slate-200 bg-slate-100 text-slate-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function InventoryIndex({
    inventoryItems,
    filters,
    categoryOptions,
    statusOptions,
    summary,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        category: filters.category === null ? '' : String(filters.category),
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setTableFilters((currentFilters) => {
                const nextFilters = {
                    category:
                        filters.category === null
                            ? ''
                            : String(filters.category),
                    status: filters.status,
                    per_page: String(filters.per_page),
                };

                if (
                    currentFilters.category === nextFilters.category &&
                    currentFilters.status === nextFilters.status &&
                    currentFilters.per_page === nextFilters.per_page
                ) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [filters.category, filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentCategory =
            filters.category === null ? '' : String(filters.category);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.category === currentCategory &&
            tableFilters.status === filters.status &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(inventoryIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    category:
                        tableFilters.category === ''
                            ? undefined
                            : Number(tableFilters.category),
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['inventoryItems', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.category,
        filters.per_page,
        filters.search,
        filters.status,
        searchInput,
        tableFilters,
    ]);
    const summaryCards = [
        {
            title: 'Items',
            value: summary.item_count,
            icon: Package,
            iconClassName: 'bg-sky-50 text-sky-700',
        },
        {
            title: 'Warehouses',
            value: summary.warehouse_count,
            icon: Building2,
            iconClassName: 'bg-indigo-50 text-indigo-700',
        },
        {
            title: 'Low stock',
            value: summary.low_stock_count,
            icon: TriangleAlert,
            iconClassName: 'bg-amber-50 text-amber-700',
        },
    ];

    return (
        <>
            <Head title="Inventory Items" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Inventory Items
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Company-owned stock records with reorder visibility.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card
                                key={card.title}
                                className="border-border/70 py-4 shadow-sm"
                            >
                                <CardContent className="flex items-center gap-3">
                                    <div
                                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <CardDescription>
                                            {card.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl tracking-tight">
                                            {card.value}
                                        </CardTitle>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search inventory items"
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

                        <FilterSelect
                            value={tableFilters.category}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    category: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[220px]"
                        >
                            <option value="">All categories</option>
                            {categoryOptions.map((option) => (
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
                            <Link href={inventoryCreate()}>
                                <Plus />
                                New item
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={inventoryItems}
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
                                <th>Item</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th className="text-right">On hand</th>
                                <th className="text-right">Reorder</th>
                                <th className="text-right">Cost</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {inventoryItems.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No inventory items matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {inventoryItems.data.map((inventoryItem) => (
                                <tr key={inventoryItem.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {inventoryItem.item_name}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    inventoryItem.item_code,
                                                    inventoryItem.sku,
                                                    inventoryItem.unit,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[12rem] truncate">
                                            {inventoryItem.category.name ??
                                                'Uncategorized'}
                                        </p>
                                    </td>

                                    <td>
                                        <div className="flex flex-col items-start gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(
                                                    inventoryItem.status,
                                                )}
                                            >
                                                {inventoryItem.status_label}
                                            </Badge>
                                            {inventoryItem.is_low_stock && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-amber-200 bg-amber-50 text-amber-700"
                                                >
                                                    Low stock
                                                </Badge>
                                            )}
                                        </div>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {inventoryItem.quantity_on_hand.toFixed(
                                            2,
                                        )}
                                    </td>

                                    <td className="text-right font-medium text-muted-foreground tabular-nums">
                                        {inventoryItem.reorder_level.toFixed(2)}
                                    </td>

                                    <td className="text-right font-medium text-muted-foreground tabular-nums">
                                        {formatCurrency(
                                            inventoryItem.standard_cost,
                                        )}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="inventory item"
                                                items={[
                                                    ...(inventoryItem.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: inventoryShow(
                                                                      inventoryItem.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(inventoryItem.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: inventoryEdit(
                                                                      inventoryItem.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(inventoryItem.can.delete
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
                                                                                  inventoryDestroy(
                                                                                      inventoryItem.id,
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
                                                label={`Open actions for ${inventoryItem.item_name}`}
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

InventoryIndex.layout = {
    breadcrumbs: inventoryBreadcrumbs,
};
