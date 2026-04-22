import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as positionsCreate,
    edit as positionsEdit,
    index as positionsIndex,
} from '@/routes/positions';
import { DataTableCard } from '@/components/data-table-card';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PaginatedData, PositionListItem, SelectOption } from '@/types';

type Props = {
    positions: PaginatedData<PositionListItem>;
    filters: {
        search: string;
        department: number | null;
        active: string;
    };
    departmentOptions: SelectOption[];
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

export default function PositionsIndex({
    positions,
    filters,
    departmentOptions,
    activityOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Positions" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Positions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain the job titles used by employee assignment
                            records and payroll review screens.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={positionsCreate()}>New position</Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={positionsIndex()}
                    resetHref={positionsIndex()}
                    filters={filters}
                    description="Search position titles and narrow the list by department or status."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search positions"
                    />

                    <FilterSelect
                        name="department"
                        defaultValue={filters.department ?? ''}
                    >
                        <option value="">All departments</option>
                        {departmentOptions.map((option) => (
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
                    title="Position list"
                    description={`${positions.total} position records`}
                    pagination={positions}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Position
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Department
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Employees
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
                            {positions.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No positions matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {positions.data.map((position) => (
                                <tr
                                    key={position.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {position.title}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {position.description ??
                                                    'No description'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {position.department.name ??
                                            'No department'}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {position.employee_count}
                                    </td>
                                    <td className="px-6 py-4">
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
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {position.can.update && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={positionsEdit(
                                                            position.id,
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

PositionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Positions', href: positionsIndex() },
    ],
};
