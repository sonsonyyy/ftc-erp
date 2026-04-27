import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as employeesCreate,
    index as employeesIndex,
} from '@/routes/employees';
import { EmployeeForm } from '@/components/payroll/employee-form';
import type {
    EmployeeFormDefaults,
    PositionOption,
    SelectOption,
} from '@/types';

type Props = {
    departmentOptions: SelectOption[];
    positionOptions: PositionOption[];
    employmentStatusOptions: SelectOption[];
    defaults: EmployeeFormDefaults;
};

export default function EmployeesCreate({
    departmentOptions,
    positionOptions,
    employmentStatusOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Employee" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <EmployeeForm
                    departmentOptions={departmentOptions}
                    positionOptions={positionOptions}
                    employmentStatusOptions={employmentStatusOptions}
                    defaults={defaults}
                    title="New employee"
                    description="Register the employee profile now so payroll runs and future statutory records have a clean source record."
                    cancelHref={employeesIndex()}
                />
            </div>
        </>
    );
}

EmployeesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Employees', href: employeesIndex() },
        { title: 'New employee', href: employeesCreate() },
    ],
};
