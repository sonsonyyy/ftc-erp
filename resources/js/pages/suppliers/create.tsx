import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as suppliersIndex } from '@/routes/suppliers';
import { SupplierForm } from '@/components/purchasing/supplier-form';

export default function SuppliersCreate() {
    return (
        <>
            <Head title="New Supplier" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <SupplierForm
                    title="New supplier"
                    description="Register the supplier record before linking it to purchase requests, POs, and receiving."
                    cancelHref={suppliersIndex()}
                />
            </div>
        </>
    );
}

SuppliersCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Suppliers', href: suppliersIndex() },
        { title: 'New supplier', href: suppliersIndex() },
    ],
};
