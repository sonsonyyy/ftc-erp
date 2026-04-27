import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as suppliersIndex,
    show as suppliersShow,
} from '@/routes/suppliers';
import { SupplierForm } from '@/components/purchasing/supplier-form';
import type { SupplierDetail } from '@/types';

type Props = {
    supplier: SupplierDetail;
};

export default function SuppliersEdit({ supplier }: Props) {
    return (
        <>
            <Head title={`Edit ${supplier.supplier_code}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <SupplierForm
                    supplier={supplier}
                    title={`Edit ${supplier.supplier_code}`}
                    description="Update the supplier record while keeping existing purchasing links intact."
                    cancelHref={suppliersShow(supplier.id)}
                />
            </div>
        </>
    );
}

SuppliersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Suppliers', href: suppliersIndex() },
        { title: 'Edit supplier', href: suppliersIndex() },
    ],
};
