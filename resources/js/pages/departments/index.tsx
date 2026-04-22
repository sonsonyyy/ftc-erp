import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as departmentsCreate,
    edit as departmentsEdit,
    index as departmentsIndex,
} from '@/routes/departments';
import { DataTableCard } from '@/components/data-table-card';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DepartmentListItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    departments: PaginatedData<DepartmentListItem>;
    filters: {
        search: string;
        active: string;
    };
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

export default function DepartmentsIndex({
    departments,
    filters,
    activityOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Departments" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Departments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain the department structure used by employee
                            records, positions, and payroll filtering.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={departmentsCreate()}>
                                New department
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={departmentsIndex()}
                    resetHref={departmentsIndex()}
                    filters={filters}
                    description="Search department names and narrow the list by active or inactive status."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search departments"
                    />

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
                    title="Department list"
                    description={`${departments.total} department records`}
                    pagination={departments}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Department
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    People structure
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
                            {departments.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No departments matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {departments.data.map((department) => (
                                <tr
                                    key={department.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {department.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {department.description ??
                                                    'No description'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {department.position_count} positions •{' '}
                                        {department.employee_count} employees
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={activityBadgeClass(
                                                department.is_active,
                                            )}
                                        >
                                            {department.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {department.can.update && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={departmentsEdit(
                                                            department.id,
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

DepartmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Departments', href: departmentsIndex() },
    ],
};
