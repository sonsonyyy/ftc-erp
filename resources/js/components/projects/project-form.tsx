import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import ProjectController from '@/actions/App/Http/Controllers/Projects/ProjectController';
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
import type {
    ProjectDetail,
    ProjectFormDefaults,
    ProjectQuotationOption,
    ProjectSiteOption,
    SelectOption,
} from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    project?: ProjectDetail;
    defaults?: ProjectFormDefaults;
    customerOptions: SelectOption[];
    siteOptions: ProjectSiteOption[];
    quotationOptions: ProjectQuotationOption[];
    statusOptions?: SelectOption[];
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function ProjectForm({
    project,
    defaults,
    customerOptions,
    siteOptions,
    quotationOptions,
    statusOptions = [],
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        project_no: project?.project_no ?? '',
        quotation_id: project?.quotation_id
            ? String(project.quotation_id)
            : defaults?.quotation_id
              ? String(defaults.quotation_id)
              : '',
        customer_id: project?.customer_id
            ? String(project.customer_id)
            : defaults?.customer_id
              ? String(defaults.customer_id)
              : '',
        customer_site_id: project?.customer_site_id
            ? String(project.customer_site_id)
            : defaults?.customer_site_id
              ? String(defaults.customer_site_id)
              : '',
        title: project?.title ?? defaults?.title ?? '',
        project_type: project?.project_type ?? '',
        start_date: project?.start_date ?? defaults?.start_date ?? '',
        target_end_date: project?.target_end_date ?? '',
        status: project?.status ?? defaults?.status ?? 'draft',
        description: project?.description ?? defaults?.description ?? '',
    });

    const isCreate = project === undefined;
    const availableSiteOptions =
        form.data.customer_id === ''
            ? []
            : siteOptions.filter(
                  (option) =>
                      option.customer_id === Number(form.data.customer_id),
              );
    const availableQuotationOptions =
        form.data.customer_id === ''
            ? quotationOptions
            : quotationOptions.filter(
                  (option) =>
                      option.customer_id === Number(form.data.customer_id),
              );
    const selectedCustomer = customerOptions.find(
        (option) => String(option.value) === form.data.customer_id,
    );
    const selectedSite = siteOptions.find(
        (option) => String(option.value) === form.data.customer_site_id,
    );
    const selectedQuotation = quotationOptions.find(
        (option) => String(option.value) === form.data.quotation_id,
    );

    function handleCustomerChange(customerId: string) {
        form.setData('customer_id', customerId);

        const nextSiteOptions =
            customerId === ''
                ? []
                : siteOptions.filter(
                      (option) => option.customer_id === Number(customerId),
                  );
        const nextQuotationOptions =
            customerId === ''
                ? quotationOptions
                : quotationOptions.filter(
                      (option) => option.customer_id === Number(customerId),
                  );

        if (
            !nextSiteOptions.some(
                (option) => String(option.value) === form.data.customer_site_id,
            )
        ) {
            form.setData('customer_site_id', '');
        }

        if (
            !nextQuotationOptions.some(
                (option) => String(option.value) === form.data.quotation_id,
            )
        ) {
            form.setData('quotation_id', '');
        }
    }

    function handleQuotationChange(quotationId: string) {
        form.setData('quotation_id', quotationId);

        if (quotationId === '') {
            return;
        }

        const selectedQuotation = quotationOptions.find(
            (option) => String(option.value) === quotationId,
        );

        if (!selectedQuotation) {
            return;
        }

        form.setData('customer_id', String(selectedQuotation.customer_id));

        if (selectedQuotation.customer_site_id) {
            form.setData(
                'customer_site_id',
                String(selectedQuotation.customer_site_id),
            );
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => {
            const payload = {
                project_no: data.project_no,
                quotation_id:
                    data.quotation_id === '' ? null : Number(data.quotation_id),
                customer_id:
                    data.customer_id === '' ? null : Number(data.customer_id),
                customer_site_id:
                    data.customer_site_id === ''
                        ? null
                        : Number(data.customer_site_id),
                title: data.title,
                project_type: data.project_type,
                start_date: data.start_date || null,
                target_end_date: data.target_end_date || null,
                description: data.description || null,
            };

            if (!isCreate) {
                return payload;
            }

            return {
                ...payload,
                status: data.status,
            };
        });

        if (project) {
            form.submit(ProjectController.update(project.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(ProjectController.store(), { preserveScroll: true });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form
                onSubmit={submit}
                className="grid gap-6 xl:grid-cols-[2fr_1fr]"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Project details</CardTitle>
                        <CardDescription>
                            Capture the core project record that operations and
                            downstream work orders will rely on.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="project_no">Project number</Label>
                            <Input
                                id="project_no"
                                value={form.data.project_no}
                                onChange={(event) =>
                                    form.setData(
                                        'project_no',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="PRJ-00001"
                            />
                            <InputError message={form.errors.project_no} />
                        </div>

                        {isCreate && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Initial status</Label>
                                <SelectInput
                                    id="status"
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={form.errors.status} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="quotation_id">
                                Awarded quotation
                            </Label>
                            <SelectInput
                                id="quotation_id"
                                value={form.data.quotation_id}
                                onChange={(event) =>
                                    handleQuotationChange(
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">No quotation linked</option>
                                {availableQuotationOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <p className="text-sm text-muted-foreground">
                                Selecting an awarded quotation auto-fills the
                                customer and site to match the handoff.
                            </p>
                            <InputError message={form.errors.quotation_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <SelectInput
                                id="customer_id"
                                value={form.data.customer_id}
                                onChange={(event) =>
                                    handleCustomerChange(
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Select customer</option>
                                {customerOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <p className="text-sm text-muted-foreground">
                                Changing the customer filters the available
                                sites and quotation choices.
                            </p>
                            <InputError message={form.errors.customer_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_site_id">Site</Label>
                            <SelectInput
                                id="customer_site_id"
                                value={form.data.customer_site_id}
                                onChange={(event) =>
                                    form.setData(
                                        'customer_site_id',
                                        event.currentTarget.value,
                                    )
                                }
                                disabled={form.data.customer_id === ''}
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    {form.data.customer_id === ''
                                        ? 'Select customer first'
                                        : 'Select site'}
                                </option>
                                {availableSiteOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <p className="text-sm text-muted-foreground">
                                Keep the site aligned with the awarded quotation
                                when this project comes from sales handoff.
                            </p>
                            <InputError
                                message={form.errors.customer_site_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Project title</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData(
                                        'title',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Main office sprinkler upgrade"
                            />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="project_type">Project type</Label>
                            <Input
                                id="project_type"
                                value={form.data.project_type}
                                onChange={(event) =>
                                    form.setData(
                                        'project_type',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Installation"
                            />
                            <InputError message={form.errors.project_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={form.data.start_date}
                                onChange={(event) =>
                                    form.setData(
                                        'start_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.start_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="target_end_date">
                                Target end date
                            </Label>
                            <Input
                                id="target_end_date"
                                type="date"
                                value={form.data.target_end_date}
                                onChange={(event) =>
                                    form.setData(
                                        'target_end_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.target_end_date} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
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
                                placeholder="Scope summary, delivery notes, or operational handoff context."
                                rows={5}
                            />
                            <InputError message={form.errors.description} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Linkage summary</CardTitle>
                        <CardDescription>
                            Double-check the operational context before you save
                            the project record.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Awarded quotation
                            </p>
                            <p className="mt-1 font-medium">
                                {selectedQuotation?.label ??
                                    'No quotation linked'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Customer
                            </p>
                            <p className="mt-1 font-medium">
                                {selectedCustomer?.label ?? 'Select a customer'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Site
                            </p>
                            <p className="mt-1 font-medium">
                                {selectedSite?.label ??
                                    (form.data.customer_id === ''
                                        ? 'Select a customer first'
                                        : 'Select a site')}
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Use the quotation first when this project starts
                            from an awarded sale so the customer and site stay
                            consistent across modules.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Save project</CardTitle>
                        <CardDescription>
                            Keep the project master clean. Status changes and
                            team assignments happen on the detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? project
                                    ? 'Saving changes...'
                                    : 'Creating project...'
                                : project
                                  ? 'Save changes'
                                  : 'Create project'}
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
