import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as departmentsCreate, edit as departmentsEdit, index as departmentsIndex } from '@/routes/departments';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function DepartmentsIndex({ departments, filters, activityOptions, can }: Props) {
    return (
        <>
            <Head title="Departments" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain the department structure used by employee records, positions, and payroll filtering.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={departmentsCreate()}>New department</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search department names and narrow the list by active or inactive status.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={departmentsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 md:grid-cols-[2fr_1fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search departments" />

                            <select
                                name="active"
                                defaultValue={filters.active}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All statuses</option>
                                {activityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={departmentsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Department list</CardTitle>
                        <CardDescription>{departments.total} department records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Department</th>
                                    <th className="px-6 py-3 font-medium">People structure</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                            No departments matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {departments.data.map((department) => (
                                    <tr key={department.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{department.name}</p>
                                                <p className="text-muted-foreground">{department.description ?? 'No description'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {department.position_count} positions • {department.employee_count} employees
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={activityBadgeClass(department.is_active)}>
                                                {department.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {department.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link href={departmentsEdit(department.id)}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={departments} />
                </Card>
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
