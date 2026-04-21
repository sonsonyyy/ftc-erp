import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as complianceRecordsIndex } from '@/routes/compliance-records';
import { ComplianceRecordForm } from '@/components/compliance/compliance-record-form';
import type {
    ComplianceRecordFormDefaults,
    ComplianceTemplateOption,
    SelectOption,
} from '@/types';

type Props = {
    templateOptions: ComplianceTemplateOption[];
    assignedUserOptions: SelectOption[];
    statusOptions: SelectOption[];
    recurrenceOptions: SelectOption[];
    reminderDayOptions: Array<{
        value: number;
        label: string;
    }>;
    defaults: ComplianceRecordFormDefaults;
};

export default function ComplianceRecordsCreate({
    templateOptions,
    assignedUserOptions,
    statusOptions,
    recurrenceOptions,
    reminderDayOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Compliance Record" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <ComplianceRecordForm
                    templateOptions={templateOptions}
                    assignedUserOptions={assignedUserOptions}
                    statusOptions={statusOptions}
                    recurrenceOptions={recurrenceOptions}
                    reminderDayOptions={reminderDayOptions}
                    defaults={defaults}
                    title="New compliance record"
                    description="Register a filing, permit, or license deadline before reminders and submissions start accumulating."
                    cancelHref={complianceRecordsIndex()}
                />
            </div>
        </>
    );
}

ComplianceRecordsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Compliance', href: complianceRecordsIndex() },
        { title: 'New record', href: complianceRecordsIndex() },
    ],
};
