import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    BadgeCheck,
    Eye,
    Pencil,
    Plus,
    Search,
    Shield,
    UserMinus,
    Users,
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
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as usersCreate,
    destroy as usersDestroy,
    edit as usersEdit,
    index as usersIndex,
    show as usersShow,
} from '@/routes/users';
import type { PaginatedData, SelectOption, UserListItem } from '@/types';

type Props = {
    users: PaginatedData<UserListItem>;
    summary: {
        total_users: number;
        active_users: number;
        inactive_users: number;
        roles_in_use: number;
    };
    filters: {
        search: string;
        role: number | null;
        active: string;
        per_page: number;
    };
    roleOptions: SelectOption[];
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

function formatDate(date: string | null): string {
    if (!date) {
        return 'N/A';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

export default function UsersIndex({
    users,
    summary,
    filters,
    roleOptions,
    activityOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        role: filters.role === null ? '' : String(filters.role),
        active: filters.active,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                role: filters.role === null ? '' : String(filters.role),
                active: filters.active,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.role === nextFilters.role &&
                currentFilters.active === nextFilters.active &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.active, filters.per_page, filters.role]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentRole = filters.role === null ? '' : String(filters.role);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.role === currentRole &&
            tableFilters.active === filters.active &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(usersIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    role:
                        tableFilters.role === ''
                            ? undefined
                            : Number(tableFilters.role),
                    active: tableFilters.active,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['users', 'filters', 'summary'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.active,
        filters.per_page,
        filters.role,
        filters.search,
        searchInput,
        tableFilters,
    ]);

    const summaryCards = [
        {
            title: 'Total users',
            value: summary.total_users,
            icon: Users,
            iconClassName: 'bg-sky-50 text-sky-700',
        },
        {
            title: 'Active users',
            value: summary.active_users,
            icon: BadgeCheck,
            iconClassName: 'bg-emerald-50 text-emerald-700',
        },
        {
            title: 'Inactive users',
            value: summary.inactive_users,
            icon: UserMinus,
            iconClassName: 'bg-slate-100 text-slate-600',
        },
        {
            title: 'Roles in use',
            value: summary.roles_in_use,
            icon: Shield,
            iconClassName: 'bg-indigo-50 text-indigo-700',
        },
    ];

    return (
        <>
            <Head title="Users" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage ERP access, roles, and account status.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={usersCreate()}>
                                <Plus />
                                New user
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

                <div className="flex flex-col gap-3">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search users"
                        />

                        <FilterSelect
                            value={tableFilters.active}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    active: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[180px]"
                        >
                            <option value="">All statuses</option>
                            {activityOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            value={tableFilters.role}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    role: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[220px]"
                        >
                            <option value="">All roles</option>
                            {roleOptions.map((option) => (
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
                            pagination={users}
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
                                <th>User</th>
                                <th>Roles</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No users matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {users.data.map((managedUser) => (
                                <tr key={managedUser.id}>
                                    <td>
                                        <div className="space-y-1">
                                            <p className="truncate font-medium text-foreground">
                                                {managedUser.name}
                                            </p>
                                            <p className="truncate text-[13px] text-muted-foreground">
                                                {managedUser.email}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex flex-wrap gap-1.5">
                                            {managedUser.roles
                                                .slice(0, 2)
                                                .map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="secondary"
                                                        className="max-w-[180px] truncate"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}

                                            {managedUser.roles.length > 2 && (
                                                <Badge variant="secondary">
                                                    +
                                                    {managedUser.roles.length -
                                                        2}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="outline"
                                                className={activityBadgeClass(
                                                    managedUser.is_active,
                                                )}
                                            >
                                                {managedUser.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>

                                            <Badge variant="outline">
                                                {managedUser.email_verified_at
                                                    ? 'Verified'
                                                    : 'Unverified'}
                                            </Badge>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        {formatDate(managedUser.created_at)}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                resourceLabel="user"
                                                items={[
                                                    ...(managedUser.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: usersShow(
                                                                      managedUser.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(managedUser.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: usersEdit(
                                                                      managedUser.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(managedUser.can.delete
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
                                                                                  usersDestroy(
                                                                                      managedUser.id,
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
                                                label={`Open actions for ${managedUser.name}`}
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

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Users',
            href: usersIndex(),
        },
    ],
};
