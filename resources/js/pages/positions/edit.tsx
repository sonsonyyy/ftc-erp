import { Head, Link } from '@inertiajs/react';
import PositionController from '@/actions/App/Http/Controllers/Payroll/PositionController';
import { dashboard } from '@/routes';
import {
    edit as positionsEdit,
    index as positionsIndex,
} from '@/routes/positions';
import { PositionForm } from '@/components/payroll/position-form';
import { Button } from '@/components/ui/button';
import type { PositionDetail, SelectOption } from '@/types';

type Props = {
    position: PositionDetail;
    departmentOptions: SelectOption[];
};

export default function PositionsEdit({ position, departmentOptions }: Props) {
    return (
        <>
            <Head title={position.title} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex justify-end">
                    {position.can.delete && (
                        <Button variant="outline" asChild>
                            <Link
                                href={PositionController.destroy(position.id)}
                                method="delete"
                                as="button"
                            >
                                Archive position
                            </Link>
                        </Button>
                    )}
                </div>

                <PositionForm
                    position={position}
                    departmentOptions={departmentOptions}
                    title={position.title}
                    description="Adjust the position record used by employee records and payroll review lines."
                    cancelHref={positionsIndex()}
                />
            </div>
        </>
    );
}

PositionsEdit.layout = ({ position }: Props) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Positions', href: positionsIndex() },
        { title: position.title, href: positionsEdit(position.id) },
    ],
});
