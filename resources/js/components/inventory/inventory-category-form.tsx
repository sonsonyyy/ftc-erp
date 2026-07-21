import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import InventoryCategoryController from '@/actions/App/Http/Controllers/Inventory/InventoryCategoryController';
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
import type { InventoryCategoryFormData } from '@/types';

type Props = {
    inventoryCategory?: InventoryCategoryFormData;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function InventoryCategoryForm({
    inventoryCategory,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        name: inventoryCategory?.name ?? '',
        description: inventoryCategory?.description ?? '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            description: data.description || null,
        }));

        if (inventoryCategory?.id) {
            form.submit(
                InventoryCategoryController.update(inventoryCategory.id),
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        form.submit(InventoryCategoryController.store(), {
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
                        <CardTitle>Category details</CardTitle>
                        <CardDescription>
                            Keep category labels simple so warehouse users can
                            classify stock consistently.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Category name</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData(
                                        'name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Sprinkler Components"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.currentTarget.value,
                                    )
                                }
                                rows={5}
                                placeholder="Optional notes about which inventory items belong in this category."
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Categories are used by filters and low-stock views
                            across the module.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? 'Saving...'
                                : inventoryCategory?.id
                                  ? 'Update category'
                                  : 'Create category'}
                        </Button>

                        <Button variant="outline" className="w-full" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
