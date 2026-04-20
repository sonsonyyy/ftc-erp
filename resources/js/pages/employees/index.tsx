import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as employeesCreate, edit as employeesEdit, index as employeesIndex, show as employeesShow } from '@/routes/employees';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { EmployeeListItem, PaginatedData, SelectOption } from '@/types';

type Props = {
    employees: PaginatedData<EmployeeListItem>;
    filters: {
        search: string;
        department: number | null;
        position: number | null;
        employment_status: string;
        active: string;
    };
    departmentOptions: SelectOption[];
    positionOptions: SelectOption[];
    employmentStatusOptions: SelectOption[];
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

function employmentBadgeClass(status: string): string {
    return {
        regular: 'border-sky-200 bg-sky-50 text-sky-700',
        probationary: 'border-amber-200 bg-amber-50 text-amber-700',
        contractual: 'border-rose-200 bg-rose-50 text-rose-700',
        project_based: 'border-violet-200 bg-violet-50 text-violet-700',
        part_time: 'border-slate-200 bg-slate-100 text-slate-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
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
    filters,
    departmentOptions,
    positionOptions,
    employmentStatusOptions,
    activityOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Employees" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain the employee masterfile used by payroll runs and future statutory reporting.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={employeesCreate()}>New employee</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by employee no., name, email, phone, or government ID, then narrow by assignment and status.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={employeesIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search employees" />

                            <select
                                name="department"
                                defaultValue={filters.department ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All departments</option>
                                {departmentOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="position"
                                defaultValue={filters.position ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All positions</option>
                                {positionOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="employment_status"
                                defaultValue={filters.employment_status}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All employment statuses</option>
                                {employmentStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="active"
                                defaultValue={filters.active}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All activity states</option>
                                {activityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={employeesIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee list</CardTitle>
                        <CardDescription>{employees.total} employee records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Employee</th>
                                    <th className="px-6 py-3 font-medium">Assignment</th>
                                    <th className="px-6 py-3 font-medium">Salary</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                                            No employees matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {employees.data.map((employee) => (
                                    <tr key={employee.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{employee.full_name}</p>
                                                <p className="text-muted-foreground">
                                                    {employee.employee_no}
                                                    {employee.email ? ` • ${employee.email}` : ''}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {employee.payroll_entry_count} payroll entries
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{employee.department.name ?? 'No department'}</p>
                                                <p>{employee.position.title ?? 'No position'}</p>
                                                <p>{employee.hire_date ? `Hired ${employee.hire_date}` : 'No hire date'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(employee.basic_salary)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className={employmentBadgeClass(employee.employment_status)}>
                                                    {employee.employment_status_label}
                                                </Badge>
                                                <Badge variant="outline" className={activityBadgeClass(employee.is_active)}>
                                                    {employee.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {employee.can.view && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={employeesShow(employee.id)}>Open</Link>
                                                    </Button>
                                                )}
                                                {employee.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link href={employeesEdit(employee.id)}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={employees} />
                </Card>
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
