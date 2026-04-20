import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as departmentsCreate, index as departmentsIndex } from '@/routes/departments';
import { DepartmentForm } from '@/components/payroll/department-form';

type Props = {
    defaults: {
        is_active: boolean;
    };
};

export default function DepartmentsCreate({ defaults }: Props) {
    return (
        <>
            <Head title="New Department" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <DepartmentForm
                    defaults={defaults}
                    title="New department"
                    description="Create a department record for employee organization and payroll filtering."
                    cancelHref={departmentsIndex()}
                />
            </div>
        </>
    );
}

DepartmentsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Departments', href: departmentsIndex() },
        { title: 'New department', href: departmentsCreate() },
    ],
};
