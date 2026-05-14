import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import PositionController from '@/actions/App/Http/Controllers/Payroll/PositionController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PositionDetail, SelectOption } from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    position?: PositionDetail;
    departmentOptions: SelectOption[];
    defaults?: {
        is_active: boolean;
    };
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function PositionForm({
    position,
    departmentOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        department_id: position?.department_id
            ? String(position.department_id)
            : '',
        title: position?.title ?? '',
        description: position?.description ?? '',
        is_active: position
            ? position.is_active
                ? '1'
                : '0'
            : defaults?.is_active === false
              ? '0'
              : '1',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            department_id:
                data.department_id === '' ? null : Number(data.department_id),
            title: data.title,
            description: data.description || null,
            is_active: data.is_active === '1',
        }));

        if (position) {
            form.submit(PositionController.update(position.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(PositionController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form
                onSubmit={submit}
                className="grid gap-6 lg:grid-cols-[2fr_1fr]"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Position details</CardTitle>
                        <CardDescription>
                            Keep position records aligned with departments so
                            employee assignments and payroll views stay
                            consistent.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="department_id">Department</Label>
                            <SelectInput
                                id="department_id"
                                value={form.data.department_id}
                                onChange={(event) =>
                                    form.setData(
                                        'department_id',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">No specific department</option>
                                {departmentOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.department_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Position title</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData(
                                        'title',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Project Engineer"
                            />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Optional notes on what this role commonly handles."
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Mark inactive positions when they should no longer
                            be assigned to new employees.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Status</Label>
                            <SelectInput
                                id="is_active"
                                value={form.data.is_active}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </SelectInput>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                {position ? 'Save position' : 'Create position'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
