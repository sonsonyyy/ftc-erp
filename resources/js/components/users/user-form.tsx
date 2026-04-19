import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import type { CheckedState } from '@radix-ui/react-checkbox';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SelectOption, UserDetail } from '@/types';

type Props = {
    managedUser?: UserDetail;
    roleOptions: SelectOption[];
    defaults?: {
        is_active: boolean;
    };
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function UserForm({
    managedUser,
    roleOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        name: managedUser?.name ?? '',
        email: managedUser?.email ?? '',
        password: '',
        password_confirmation: '',
        is_active: managedUser
            ? managedUser.is_active
                ? '1'
                : '0'
            : defaults?.is_active === false
              ? '0'
              : '1',
        role_ids: managedUser?.roles.map((role) => String(role.id)) ?? [],
    });

    function toggleRole(roleId: string, checked: CheckedState) {
        const nextRoleIds = checked === true
            ? [...form.data.role_ids, roleId]
            : form.data.role_ids.filter((value) => value !== roleId);

        form.setData('role_ids', Array.from(new Set(nextRoleIds)));
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            password: data.password || null,
            password_confirmation: data.password_confirmation || null,
            is_active: data.is_active === '1',
            role_ids: data.role_ids.map((roleId) => Number(roleId)),
        }));

        if (managedUser) {
            form.submit(UserController.update(managedUser.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(UserController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account details</CardTitle>
                            <CardDescription>
                                Create and maintain internal user accounts for ERP access.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.currentTarget.value)
                                    }
                                    placeholder="Juan Dela Cruz"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData('email', event.currentTarget.value)
                                    }
                                    placeholder="user@company.com"
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {managedUser ? 'New password' : 'Password'}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData('password', event.currentTarget.value)
                                    }
                                    placeholder={
                                        managedUser
                                            ? 'Leave blank to keep current password'
                                            : 'Set initial password'
                                    }
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.currentTarget.value,
                                        )
                                    }
                                    placeholder="Confirm password"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {managedUser && managedUser.permissions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Effective permissions</CardTitle>
                                <CardDescription>
                                    Permissions inherited from the selected roles.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex flex-wrap gap-2">
                                {managedUser.permissions.map((permission) => (
                                    <Badge key={permission} variant="secondary">
                                        {permission}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Access control</CardTitle>
                            <CardDescription>
                                Assign at least one role and control whether the account can sign in.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="is_active">Account status</Label>
                                <select
                                    id="is_active"
                                    value={form.data.is_active}
                                    onChange={(event) =>
                                        form.setData('is_active', event.currentTarget.value)
                                    }
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                <InputError message={form.errors.is_active} />
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label>Roles</Label>
                                    <p className="text-sm text-muted-foreground">
                                        The selected roles determine the user’s ERP access.
                                    </p>
                                </div>

                                <div className="space-y-3 rounded-lg border p-4">
                                    {roleOptions.map((option) => {
                                        const roleId = String(option.value);

                                        return (
                                            <label
                                                key={roleId}
                                                className="flex items-start gap-3 rounded-md"
                                            >
                                                <Checkbox
                                                    checked={form.data.role_ids.includes(roleId)}
                                                    onCheckedChange={(checked) =>
                                                        toggleRole(roleId, checked)
                                                    }
                                                />
                                                <span className="text-sm font-medium leading-5">
                                                    {option.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.role_ids} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                Save the account now and fine-tune access as the ERP grows.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Saving...'
                                    : managedUser
                                      ? 'Save changes'
                                      : 'Create user'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
