import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as payrollRunsCreate, index as payrollRunsIndex } from '@/routes/payroll-runs';
import { PayrollRunForm } from '@/components/payroll/payroll-run-form';
import type { PayrollEmployeeOption, PayrollRunFormDefaults, SelectOption } from '@/types';

type Props = {
    employeeOptions: PayrollEmployeeOption[];
    statusOptions: SelectOption[];
    defaults: PayrollRunFormDefaults;
};

export default function PayrollRunsCreate({
    employeeOptions,
    statusOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Payroll Run" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <PayrollRunForm
                    employeeOptions={employeeOptions}
                    statusOptions={statusOptions}
                    defaults={defaults}
                    title="New payroll run"
                    description="Create a payroll batch, encode employee entries, and review totals before processing."
                    cancelHref={payrollRunsIndex()}
                />
            </div>
        </>
    );
}

PayrollRunsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Payroll Runs', href: payrollRunsIndex() },
        { title: 'New payroll run', href: payrollRunsCreate() },
    ],
};
