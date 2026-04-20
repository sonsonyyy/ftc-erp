import { Head, Link } from '@inertiajs/react';
import PayrollRunController from '@/actions/App/Http/Controllers/Payroll/PayrollRunController';
import { dashboard } from '@/routes';
import { edit as payrollRunsEdit, index as payrollRunsIndex, show as payrollRunsShow } from '@/routes/payroll-runs';
import { PayrollRunForm } from '@/components/payroll/payroll-run-form';
import { Button } from '@/components/ui/button';
import type { PayrollEmployeeOption, PayrollRunDetail, SelectOption } from '@/types';

type Props = {
    payrollRun: PayrollRunDetail;
    employeeOptions: PayrollEmployeeOption[];
    statusOptions: SelectOption[];
};

export default function PayrollRunsEdit({
    payrollRun,
    employeeOptions,
    statusOptions,
}: Props) {
    return (
        <>
            <Head title={payrollRun.payroll_run_no} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex justify-end">
                    {payrollRun.can.delete && (
                        <Button variant="outline" asChild>
                            <Link href={PayrollRunController.destroy(payrollRun.id)} method="delete" as="button">
                                Archive payroll run
                            </Link>
                        </Button>
                    )}
                </div>

                <PayrollRunForm
                    payrollRun={payrollRun}
                    employeeOptions={employeeOptions}
                    statusOptions={statusOptions}
                    title={payrollRun.payroll_run_no}
                    description="Adjust the payroll header, employee lines, and deductions before final processing."
                    cancelHref={payrollRunsShow(payrollRun.id)}
                />
            </div>
        </>
    );
}

PayrollRunsEdit.layout = ({ payrollRun }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Payroll Runs', href: payrollRunsIndex() },
        { title: payrollRun.payroll_run_no, href: payrollRunsEdit(payrollRun.id) },
    ],
});
