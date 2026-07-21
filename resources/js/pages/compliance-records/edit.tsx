import { Head } from '@inertiajs/react';
import { ComplianceRecordForm } from '@/components/compliance/compliance-record-form';
import { dashboard } from '@/routes';
import {
    index as complianceRecordsIndex,
    show as complianceRecordsShow,
} from '@/routes/compliance-records';
import type {
    ComplianceRecordDetail,
    ComplianceTemplateOption,
    SelectOption,
} from '@/types';

type Props = {
    complianceRecord: ComplianceRecordDetail;
    templateOptions: ComplianceTemplateOption[];
    assignedUserOptions: SelectOption[];
    statusOptions: SelectOption[];
    recurrenceOptions: SelectOption[];
    reminderDayOptions: Array<{
        value: number;
        label: string;
    }>;
};

export default function ComplianceRecordsEdit({
    complianceRecord,
    templateOptions,
    assignedUserOptions,
    statusOptions,
    recurrenceOptions,
    reminderDayOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${complianceRecord.record_no}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <ComplianceRecordForm
                    complianceRecord={complianceRecord}
                    templateOptions={templateOptions}
                    assignedUserOptions={assignedUserOptions}
                    statusOptions={statusOptions}
                    recurrenceOptions={recurrenceOptions}
                    reminderDayOptions={reminderDayOptions}
                    title={`Edit ${complianceRecord.record_no}`}
                    description="Update the compliance master record while keeping task history, submissions, and alerts on the detail page."
                    cancelHref={complianceRecordsShow(complianceRecord.id)}
                />
            </div>
        </>
    );
}

ComplianceRecordsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Compliance', href: complianceRecordsIndex() },
        { title: 'Edit record', href: complianceRecordsIndex() },
    ],
};
