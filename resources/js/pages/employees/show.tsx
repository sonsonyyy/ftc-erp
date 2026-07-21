import { Head, Link } from '@inertiajs/react';
import EmployeeController from '@/actions/App/Http/Controllers/Payroll/EmployeeController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import {
    edit as employeesEdit,
    index as employeesIndex,
    show as employeesShow,
} from '@/routes/employees';
import type { EmployeeDetail } from '@/types';

type Props = {
    employee: EmployeeDetail;
};

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

export default function EmployeesShow({ employee }: Props) {
    const payrollHistory = employee.payroll_history ?? [];

    return (
        <>
            <Head title={employee.full_name} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {employee.full_name}
                            </h1>
                            <Badge
                                variant="outline"
                                className={employmentBadgeClass(
                                    employee.employment_status,
                                )}
                            >
                                {employee.employment_status_label}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={activityBadgeClass(
                                    employee.is_active,
                                )}
                            >
                                {employee.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {employee.employee_no} •{' '}
                            {employee.department.name ?? 'No department'} •{' '}
                            {employee.position.title ?? 'No position'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {employee.can.update && (
                            <Button asChild>
                                <Link href={employeesEdit(employee.id)}>
                                    Edit employee
                                </Link>
                            </Button>
                        )}

                        {employee.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={EmployeeController.destroy(
                                        employee.id,
                                    )}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Basic salary</CardDescription>
                            <CardTitle>
                                {formatCurrency(employee.basic_salary)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Payroll entries</CardDescription>
                            <CardTitle>
                                {employee.payroll_entry_count}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Hire date</CardDescription>
                            <CardTitle>
                                {employee.hire_date ?? 'Not set'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Contact phone</CardDescription>
                            <CardTitle>{employee.phone ?? 'Not set'}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee details</CardTitle>
                            <CardDescription>
                                Core employee, assignment, and payroll-ready
                                government information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Department
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.department.name ?? 'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Position
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.position.title ?? 'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.email ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Phone
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.phone ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Address
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {employee.address ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    TIN
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.tin ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    SSS no.
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.sss_no ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pag-IBIG no.
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.pagibig_no ?? 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    PhilHealth no.
                                </p>
                                <p className="mt-1 font-medium">
                                    {employee.philhealth_no ?? 'Not set'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent payroll history</CardTitle>
                            <CardDescription>
                                Latest payroll entries linked to this employee.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {payrollHistory.length === 0 && (
                                <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                    No payroll entries recorded yet.
                                </div>
                            )}

                            {payrollHistory.map((historyItem) => (
                                <div
                                    key={historyItem.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <p className="font-medium">
                                        {historyItem.payroll_run
                                            .payroll_run_no ?? 'Payroll run'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {historyItem.payroll_run.payroll_date ??
                                            'No payroll date'}{' '}
                                        •{' '}
                                        {historyItem.payroll_run.status_label ??
                                            'No status'}{' '}
                                        • Net{' '}
                                        {formatCurrency(historyItem.net_pay)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Gross{' '}
                                        {formatCurrency(historyItem.gross_pay)}{' '}
                                        • Deductions{' '}
                                        {formatCurrency(
                                            historyItem.total_deductions,
                                        )}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

EmployeesShow.layout = ({ employee }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Employees', href: employeesIndex() },
        { title: employee.full_name, href: employeesShow(employee.id) },
    ],
});
