import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as usersCreate,
    edit as usersEdit,
    index as usersIndex,
    show as usersShow,
} from '@/routes/users';
import { DataTableCard } from '@/components/data-table-card';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PaginatedData, SelectOption, UserListItem } from '@/types';

type Props = {
    users: PaginatedData<UserListItem>;
    filters: {
        search: string;
        role: number | null;
        active: string;
    };
    roleOptions: SelectOption[];
    activityOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

function activityBadgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function UsersIndex({
    users,
    filters,
    roleOptions,
    activityOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Users" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Provision ERP users internally and control their
                            roles before they access business modules.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={usersCreate()}>New user</Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={usersIndex()}
                    resetHref={usersIndex()}
                    filters={filters}
                    description="Search by user name or email, then narrow by role or account status."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search users"
                    />

                    <FilterSelect name="role" defaultValue={filters.role ?? ''}>
                        <option value="">All roles</option>
                        {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect name="active" defaultValue={filters.active}>
                        <option value="">All statuses</option>
                        {activityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <DataTableCard
                    title="User list"
                    description={`${users.total} total internal users`}
                    pagination={users}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">User</th>
                                <th className="px-6 py-3 font-medium">Roles</th>
                                <th className="px-6 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No users matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {users.data.map((managedUser) => (
                                <tr
                                    key={managedUser.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {managedUser.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {managedUser.email}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {managedUser.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant="secondary"
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
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

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {managedUser.created_at
                                            ? new Date(
                                                  managedUser.created_at,
                                              ).toLocaleDateString()
                                            : 'N/A'}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {managedUser.can.view && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={usersShow(
                                                            managedUser.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}

                                            {managedUser.can.update && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={usersEdit(
                                                            managedUser.id,
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
                </DataTableCard>
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
