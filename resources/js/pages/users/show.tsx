import { Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { edit as usersEdit, index as usersIndex } from '@/routes/users';
import type { UserDetail } from '@/types';

type Props = {
    managedUser: UserDetail;
};

function activityBadgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function UsersShow({ managedUser }: Props) {
    return (
        <>
            <Head title={managedUser.name} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {managedUser.name}
                            </h1>
                            <Badge
                                variant="outline"
                                className={activityBadgeClass(
                                    managedUser.is_active,
                                )}
                            >
                                {managedUser.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                                {managedUser.email_verified_at
                                    ? 'Verified'
                                    : 'Unverified'}
                            </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {managedUser.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {managedUser.can.update && (
                            <Button asChild>
                                <Link href={usersEdit(managedUser.id)}>
                                    Edit user
                                </Link>
                            </Button>
                        )}

                        {managedUser.can.delete && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={UserController.destroy(
                                        managedUser.id,
                                    )}
                                    method="delete"
                                    as="button"
                                >
                                    Archive
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Assigned roles</CardDescription>
                            <CardTitle>{managedUser.roles.length}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>
                                Effective permissions
                            </CardDescription>
                            <CardTitle>
                                {managedUser.permissions.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardDescription>Created on</CardDescription>
                            <CardTitle className="text-base">
                                {managedUser.created_at
                                    ? new Date(
                                          managedUser.created_at,
                                      ).toLocaleDateString()
                                    : 'N/A'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account information</CardTitle>
                            <CardDescription>
                                Core identity details for this internal ERP
                                account.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="mt-1 font-medium">
                                    {managedUser.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Verified at
                                </p>
                                <p className="mt-1 font-medium">
                                    {managedUser.email_verified_at
                                        ? new Date(
                                              managedUser.email_verified_at,
                                          ).toLocaleString()
                                        : 'Not verified'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Created
                                </p>
                                <p className="mt-1 font-medium">
                                    {managedUser.created_at
                                        ? new Date(
                                              managedUser.created_at,
                                          ).toLocaleString()
                                        : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Last updated
                                </p>
                                <p className="mt-1 font-medium">
                                    {managedUser.updated_at
                                        ? new Date(
                                              managedUser.updated_at,
                                          ).toLocaleString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned roles</CardTitle>
                            <CardDescription>
                                Role membership is the source of truth for
                                module access.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-wrap gap-2">
                            {managedUser.roles.map((role) => (
                                <Badge key={role.id} variant="secondary">
                                    {role.name}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Effective permissions</CardTitle>
                        <CardDescription>
                            Permissions currently granted through the assigned
                            roles.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-wrap gap-2">
                        {managedUser.permissions.map((permission) => (
                            <Badge key={permission} variant="outline">
                                {permission}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersShow.layout = {
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
            title: 'User details',
            href: usersIndex(),
        },
    ],
};
