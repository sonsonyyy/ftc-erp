import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as customersCreate,
    index as customersIndex,
} from '@/routes/customers';
import { CustomerForm } from '@/components/customers/customer-form';
import type { SelectOption } from '@/types';

type Props = {
    statusOptions: SelectOption[];
};

export default function CustomersCreate({ statusOptions }: Props) {
    return (
        <>
            <Head title="New customer" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <CustomerForm
                    statusOptions={statusOptions}
                    title="New customer"
                    description="Create the customer record first, then add sites and linked attachments from the detail page."
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
