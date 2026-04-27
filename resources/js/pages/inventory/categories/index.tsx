import { Head, Link, router } from '@inertiajs/react';
import { Archive, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as inventoryCategoriesCreate,
    destroy as inventoryCategoriesDestroy,
    edit as inventoryCategoriesEdit,
    index as inventoryCategoriesIndex,
} from '@/routes/inventory-categories';
import type {
    InventoryCategoryFilters,
    InventoryCategoryListItem,
    PaginatedData,
} from '@/types';

type Props = {
    categories: PaginatedData<InventoryCategoryListItem>;
    filters: InventoryCategoryFilters;
    can: {
        create: boolean;
    };
};

const categoryBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Categories',
        href: inventoryCategoriesIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

export default function InventoryCategoriesIndex({
    categories,
    filters,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [perPage, setPerPage] = useState(String(filters.per_page));

    useEffect(() => {
        const nextPerPage = String(filters.per_page);

        setPerPage((currentPerPage) =>
            currentPerPage === nextPerPage ? currentPerPage : nextPerPage,
        );
    }, [filters.per_page]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (normalizedSearch === filters.search && perPage === currentPerPage) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(inventoryCategoriesIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    per_page: Number(perPage),
                    page: 1,
                }),
                {
                    only: ['categories', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.per_page, filters.search, perPage, searchInput]);

    return (
        <>
            <Head title="Categories" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Keep inventory classification clear and consistent.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={inventoryCategoriesCreate()}>
                                <Plus />
                                New category
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.currentTarget.value)
                            }
                            placeholder="Search categories"
                            className="h-9 pl-9"
                        />
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={categories}
                            perPage={perPage}
                            perPageOptions={perPageOptions}
                            onPerPageChange={(value) => {
                                router.cancelAll();
                                setPerPage(value);
                            }}
                        />
                    }
                >
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th className="text-right">Items</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {categories.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No categories matched the current
                                        search.
                                    </td>
                                </tr>
                            )}

                            {categories.data.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-semibold text-foreground">
                                                {category.name}
                                            </p>
                                            <p className="max-w-[24rem] truncate text-[13px] text-muted-foreground">
                                                {category.description ??
                                                    'No description'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {category.item_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(category.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: inventoryCategoriesEdit(
                                                                      category.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(category.can.delete
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
                                                                                  inventoryCategoriesDestroy(
                                                                                      category.id,
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
                                                label={`Open actions for ${category.name}`}
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

InventoryCategoriesIndex.layout = {
    breadcrumbs: categoryBreadcrumbs,
};
