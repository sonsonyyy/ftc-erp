import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as usersIndex, show as usersShow } from '@/routes/users';
import { UserForm } from '@/components/users/user-form';
import type { SelectOption, UserDetail } from '@/types';

type Props = {
    managedUser: UserDetail;
    roleOptions: SelectOption[];
};

export default function UsersEdit({ managedUser, roleOptions }: Props) {
    return (
        <>
            <Head title={`Edit ${managedUser.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <UserForm
                    managedUser={managedUser}
                    roleOptions={roleOptions}
                    title="Edit user"
                    description="Update access, reset the password if needed, and keep role assignments clean."
                    cancelHref={usersShow(managedUser.id)}
                />
            </div>
        </>
    );
}

UsersEdit.layout = {
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
            title: 'Edit user',
            href: usersIndex(),
        },
    ],
};
