import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as positionsCreate,
    index as positionsIndex,
} from '@/routes/positions';
import { PositionForm } from '@/components/payroll/position-form';
import type { SelectOption } from '@/types';

type Props = {
    departmentOptions: SelectOption[];
    defaults: {
        is_active: boolean;
    };
};

export default function PositionsCreate({
    departmentOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Position" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <PositionForm
                    departmentOptions={departmentOptions}
                    defaults={defaults}
                    title="New position"
                    description="Create a reusable job title that can be assigned to employee records."
                    cancelHref={positionsIndex()}
                />
            </div>
        </>
    );
}

PositionsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Positions', href: positionsIndex() },
        { title: 'New position', href: positionsCreate() },
    ],
};
