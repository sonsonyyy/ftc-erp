import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    BadgeCheck,
    Building2,
    ChevronDown,
    Eye,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    UserMinus,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as employeesCreate,
    destroy as employeesDestroy,
    edit as employeesEdit,
    index as employeesIndex,
    show as employeesShow,
} from '@/routes/employees';
import type { EmployeeListItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    employees: PaginatedData<EmployeeListItem>;
    summary: {
        total_employees: number;
        active_employees: number;
        inactive_employees: number;
        assigned_departments: number;
    };
    filters: {
        search: string;
        department: number | null;
        position: number | null;
        employment_status: string;
        active: string;
        per_page: number;
    };
    departmentOptions: SelectOption[];
    positionOptions: SelectOption[];
    employmentStatusOptions: SelectOption[];
    activityOptions: SelectOption[];
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

function employmentBadgeClass(status: string): string {
    return (
        {
            regular: 'border-sky-200 bg-sky-50 text-sky-700',
            probationary: 'border-amber-200 bg-amber-50 text-amber-700',
            contractual: 'border-rose-200 bg-rose-50 text-rose-700',
            project_based: 'border-violet-200 bg-violet-50 text-violet-700',
            part_time: 'border-slate-200 bg-slate-100 text-slate-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

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

export default function EmployeesIndex({
    employees,
    summary,
    filters,
    departmentOptions,
    positionOptions,
    employmentStatusOptions,
    activityOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        department:
            filters.department === null ? '' : String(filters.department),
        position: filters.position === null ? '' : String(filters.position),
        employment_status: filters.employment_status,
        active: filters.active,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                department:
                    filters.department === null
                        ? ''
                        : String(filters.department),
                position:
                    filters.position === null ? '' : String(filters.position),
                employment_status: filters.employment_status,
                active: filters.active,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.department === nextFilters.department &&
                currentFilters.position === nextFilters.position &&
                currentFilters.employment_status ===
                    nextFilters.employment_status &&
                currentFilters.active === nextFilters.active &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [
        filters.active,
        filters.department,
        filters.employment_status,
        filters.per_page,
        filters.position,
    ]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentDepartment =
            filters.department === null ? '' : String(filters.department);
        const currentPosition =
            filters.position === null ? '' : String(filters.position);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.department === currentDepartment &&
            tableFilters.position === currentPosition &&
            tableFilters.employment_status === filters.employment_status &&
            tableFilters.active === filters.active &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(employeesIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    department:
                        tableFilters.department === ''
                            ? undefined
                            : Number(tableFilters.department),
                    position:
                        tableFilters.position === ''
                            ? undefined
                            : Number(tableFilters.position),
                    employment_status: tableFilters.employment_status,
                    active: tableFilters.active,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['employees', 'filters', 'summary'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.active,
        filters.department,
        filters.employment_status,
        filters.per_page,
        filters.position,
        filters.search,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.department === '' ? 0 : 1) +
        (tableFilters.position === '' ? 0 : 1) +
        (tableFilters.employment_status === '' ? 0 : 1) +
        (tableFilters.active === '' ? 0 : 1);

    const summaryCards = [
        {
            title: 'Total employees',
            value: summary.total_employees,
            icon: Users,
            iconClassName: 'bg-sky-50 text-sky-700',
        },
        {
            title: 'Active employees',
            value: summary.active_employees,
            icon: BadgeCheck,
            iconClassName: 'bg-emerald-50 text-emerald-700',
        },
        {
            title: 'Inactive employees',
            value: summary.inactive_employees,
            icon: UserMinus,
            iconClassName: 'bg-slate-100 text-slate-600',
        },
        {
            title: 'Assigned departments',
            value: summary.assigned_departments,
            icon: Building2,
            iconClassName: 'bg-indigo-50 text-indigo-700',
        },
    ];

    return (
        <>
            <Head title="Employees" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Employees
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Employee master records for payroll and assignment
                            tracking.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={employeesCreate()}>
                                <Plus />
                                New employee
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search employees"
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
                                <DropdownMenuLabel>
                                    Employment status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.employment_status === ''
                                            ? 'all'
                                            : tableFilters.employment_status
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            employment_status:
                                                value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All employment statuses
                                    </DropdownMenuRadioItem>
                                    {employmentStatusOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Activity</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.active === ''
                                            ? 'all'
                                            : tableFilters.active
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            active:
                                                value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All activity states
                                    </DropdownMenuRadioItem>
                                    {activityOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>

                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Department
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.department === ''
                                                    ? 'all'
                                                    : tableFilters.department
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        department:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All departments
                                            </DropdownMenuRadioItem>
                                            {departmentOptions.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Position
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-80 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.position === ''
                                                    ? 'all'
                                                    : tableFilters.position
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        position:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All positions
                                            </DropdownMenuRadioItem>
                                            {positionOptions.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={employees}
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
                                <th>Employee</th>
                                <th>Assignment</th>
                                <th className="text-right">Salary</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No employees matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {employees.data.map((employee) => (
                                <tr key={employee.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {employee.full_name}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {employee.employee_no}
                                                {employee.email
                                                    ? ` • ${employee.email}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate text-[13px] font-medium text-foreground">
                                                {employee.department.name ??
                                                    'No department'}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {employee.position.title ??
                                                    'No position'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-right text-[13px]">
                                        <p className="font-medium text-foreground tabular-nums">
                                            {formatCurrency(
                                                employee.basic_salary,
                                            )}
                                        </p>
                                        <p className="text-muted-foreground">
                                            <span className="tabular-nums">
                                                {employee.payroll_entry_count}
                                            </span>{' '}
                                            payroll entries
                                        </p>
                                    </td>

                                    <td>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="outline"
                                                className={employmentBadgeClass(
                                                    employee.employment_status,
                                                )}
                                            >
                                                {
                                                    employee.employment_status_label
                                                }
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={activityBadgeClass(
                                                    employee.is_active,
                                                )}
                                            >
                                                {employee.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(employee.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: employeesShow(
                                                                      employee.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(employee.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: employeesEdit(
                                                                      employee.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(employee.can.delete
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
                                                                                  employeesDestroy(
                                                                                      employee.id,
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
                                                label={`Open actions for ${employee.full_name}`}
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

EmployeesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Employees', href: employeesIndex() },
    ],
};
