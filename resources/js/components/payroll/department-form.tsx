import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import DepartmentController from '@/actions/App/Http/Controllers/Payroll/DepartmentController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DepartmentDetail } from '@/types';

type Props = {
    department?: DepartmentDetail;
    defaults?: {
        is_active: boolean;
    };
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function DepartmentForm({ department, defaults, title, description, cancelHref }: Props) {
    const form = useForm({
        name: department?.name ?? '',
        description: department?.description ?? '',
        is_active: department
            ? department.is_active
                ? '1'
                : '0'
            : defaults?.is_active === false
              ? '0'
              : '1',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            description: data.description || null,
            is_active: data.is_active === '1',
        }));

        if (department) {
            form.submit(DepartmentController.update(department.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(DepartmentController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Department details</CardTitle>
                        <CardDescription>
                            Keep department records simple so employees, positions, and future reporting stay aligned.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Department name</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.currentTarget.value)}
                                placeholder="Operations"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.currentTarget.value)}
                                placeholder="Brief notes on the department scope and responsibilities."
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Decide whether the department should remain selectable in employee and position forms.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Status</Label>
                            <select
                                id="is_active"
                                value={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" className="w-full" disabled={form.processing}>
                                {department ? 'Save department' : 'Create department'}
                            </Button>

                            <Button type="button" variant="outline" className="w-full" asChild>
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
