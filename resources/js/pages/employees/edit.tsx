import { Head, Link } from '@inertiajs/react';
import EmployeeController from '@/actions/App/Http/Controllers/Payroll/EmployeeController';
import { dashboard } from '@/routes';
import { edit as employeesEdit, index as employeesIndex } from '@/routes/employees';
import { EmployeeForm } from '@/components/payroll/employee-form';
import { Button } from '@/components/ui/button';
import type { EmployeeDetail, PositionOption, SelectOption } from '@/types';

type Props = {
    employee: EmployeeDetail;
    departmentOptions: SelectOption[];
    positionOptions: PositionOption[];
    employmentStatusOptions: SelectOption[];
};

export default function EmployeesEdit({
    employee,
    departmentOptions,
    positionOptions,
    employmentStatusOptions,
}: Props) {
    return (
        <>
            <Head title={employee.full_name} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex justify-end">
                    {employee.can.delete && (
                        <Button variant="outline" asChild>
                            <Link href={EmployeeController.destroy(employee.id)} method="delete" as="button">
                                Archive employee
                            </Link>
                        </Button>
                    )}
                </div>

                <EmployeeForm
                    employee={employee}
                    departmentOptions={departmentOptions}
                    positionOptions={positionOptions}
                    employmentStatusOptions={employmentStatusOptions}
                    title={employee.full_name}
                    description="Update the employee record used by payroll processing and future statutory reporting."
                    cancelHref={employeesIndex()}
                />
            </div>
        </>
    );
}

EmployeesEdit.layout = ({ employee }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Employees', href: employeesIndex() },
        { title: employee.full_name, href: employeesEdit(employee.id) },
    ],
});
