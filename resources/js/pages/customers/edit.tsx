import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as customersIndex,
    show as customersShow,
} from '@/routes/customers';
import { CustomerForm } from '@/components/customers/customer-form';
import type { CustomerDetail } from '@/types';

type Props = {
    customer: CustomerDetail;
};

export default function CustomersEdit({ customer }: Props) {
    return (
        <>
            <Head title={`Edit ${customer.company_name}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <CustomerForm
                    customer={customer}
                    title="Edit customer"
                    description="Update the master record details used across sales, operations, and billing."
                    cancelHref={customersShow(customer.id)}
                />
            </div>
        </>
    );
}

CustomersEdit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Customers',
            href: customersIndex(),
        },
        {
            title: 'Edit customer',
            href: customersIndex(),
        },
    ],
};
