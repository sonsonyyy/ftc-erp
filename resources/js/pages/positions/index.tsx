import { Head, Link, router } from '@inertiajs/react';
import { Archive, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as positionsCreate,
    destroy as positionsDestroy,
    edit as positionsEdit,
    index as positionsIndex,
} from '@/routes/positions';
import type { PaginatedData, PositionListItem, SelectOption } from '@/types';

type Props = {
    positions: PaginatedData<PositionListItem>;
    filters: {
        search: string;
        department: number | null;
        status: string;
        per_page: number;
    };
    departmentOptions: SelectOption[];
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const perPageOptions = ['5', '10', '15', '25'];

function activityBadgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function PositionsIndex({
    positions,
    filters,
    departmentOptions,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        department:
            filters.department === null ? '' : String(filters.department),
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                department:
                    filters.department === null
                        ? ''
                        : String(filters.department),
                status: filters.status,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.department === nextFilters.department &&
                currentFilters.status === nextFilters.status &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.department, filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentDepartment =
            filters.department === null ? '' : String(filters.department);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.department === currentDepartment &&
            tableFilters.status === filters.status &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(positionsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    department:
                        tableFilters.department === ''
                            ? undefined
                            : Number(tableFilters.department),
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['positions', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.department,
        filters.per_page,
        filters.search,
        filters.status,
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Positions" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Positions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Job titles and department assignments for employee
                            records.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={positionsCreate()}>
                                <Plus />
                                New position
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search positions"
                                className="h-9 pl-9"
                            />
                        </div>

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
                            value={tableFilters.department}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    department: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[220px]"
                        >
                            <option value="">All departments</option>
                            {departmentOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={positions}
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
                                <th>Position</th>
                                <th>Department</th>
                                <th className="text-right">Employees</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {positions.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No positions matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {positions.data.map((position) => (
                                <tr key={position.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {position.title}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {position.description ??
                                                    'No description'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        {position.department.name ??
                                            'No department'}
                                    </td>

                                    <td className="text-right font-medium text-foreground tabular-nums">
                                        {position.employee_count}
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={activityBadgeClass(
                                                position.is_active,
                                            )}
                                        >
                                            {position.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(position.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: positionsEdit(
                                                                      position.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(position.can.delete
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
                                                                                  positionsDestroy(
                                                                                      position.id,
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
                                                label={`Open actions for ${position.title}`}
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

PositionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Positions', href: positionsIndex() },
    ],
};
