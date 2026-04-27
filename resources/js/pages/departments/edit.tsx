import { Head, Link } from '@inertiajs/react';
import DepartmentController from '@/actions/App/Http/Controllers/Payroll/DepartmentController';
import { dashboard } from '@/routes';
import {
    edit as departmentsEdit,
    index as departmentsIndex,
} from '@/routes/departments';
import { DepartmentForm } from '@/components/payroll/department-form';
import { Button } from '@/components/ui/button';
import type { DepartmentDetail } from '@/types';

type Props = {
    department: DepartmentDetail;
};

export default function DepartmentsEdit({ department }: Props) {
    return (
        <>
            <Head title={department.name} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex justify-end">
                    {department.can.delete && (
                        <Button variant="outline" asChild>
                            <Link
                                href={DepartmentController.destroy(
                                    department.id,
                                )}
                                method="delete"
                                as="button"
                            >
                                Archive department
                            </Link>
                        </Button>
                    )}
                </div>

                <DepartmentForm
                    department={department}
                    title={department.name}
                    description="Adjust the department record used by employees, positions, and payroll views."
                    cancelHref={departmentsIndex()}
                />
            </div>
        </>
    );
}

DepartmentsEdit.layout = ({ department }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Departments', href: departmentsIndex() },
        { title: department.name, href: departmentsEdit(department.id) },
    ],
});
