import { Head } from '@inertiajs/react';
import { CustomerForm } from '@/components/customers/customer-form';
import { dashboard } from '@/routes';
import {
    create as customersCreate,
    index as customersIndex,
} from '@/routes/customers';

export default function CustomersCreate() {
    return (
        <>
            <Head title="New customer" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <CustomerForm
                    title="New customer"
                    description="Create the customer record first, then continue to site setup."
                    cancelHref={customersIndex()}
                />
            </div>
        </>
    );
}

CustomersCreate.layout = {
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
            title: 'New customer',
            href: customersCreate(),
        },
    ],
};
