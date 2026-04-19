import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as usersCreate, index as usersIndex } from '@/routes/users';
import { UserForm } from '@/components/users/user-form';
import type { SelectOption } from '@/types';

type Props = {
    roleOptions: SelectOption[];
    defaults: {
        is_active: boolean;
    };
};

export default function UsersCreate({ roleOptions, defaults }: Props) {
    return (
        <>
            <Head title="New user" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <UserForm
                    roleOptions={roleOptions}
                    defaults={defaults}
                    title="New user"
                    description="Create an internal account, assign roles, and let the ERP permissions flow from there."
                    cancelHref={usersIndex()}
                />
            </div>
        </>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Users',
            href: usersIndex(),
        },
        {
            title: 'New user',
            href: usersCreate(),
        },
    ],
};
