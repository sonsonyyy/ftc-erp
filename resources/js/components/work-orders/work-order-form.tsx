import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import WorkOrderController from '@/actions/App/Http/Controllers/WorkOrders/WorkOrderController';
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
    SelectOption,
    WorkOrderDetail,
    WorkOrderFormDefaults,
    WorkOrderProjectOption,
    WorkOrderQuotationOption,
    WorkOrderSiteOption,
} from '@/types';

type Props = {
    workOrder?: WorkOrderDetail;
    defaults?: WorkOrderFormDefaults;
    customerOptions: SelectOption[];
    siteOptions: WorkOrderSiteOption[];
    quotationOptions: WorkOrderQuotationOption[];
    projectOptions: WorkOrderProjectOption[];
    priorityOptions: SelectOption[];
    serviceTypeOptions: SelectOption[];
    statusOptions?: SelectOption[];
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function WorkOrderForm({
    workOrder,
    defaults,
    customerOptions,
    siteOptions,
    quotationOptions,
    projectOptions,
    priorityOptions,
    serviceTypeOptions,
    statusOptions = [],
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        work_order_no: workOrder?.work_order_no ?? '',
        quotation_id: workOrder?.quotation_id ? String(workOrder.quotation_id) : defaults?.quotation_id ? String(defaults.quotation_id) : '',
        project_id: workOrder?.project_id ? String(workOrder.project_id) : defaults?.project_id ? String(defaults.project_id) : '',
        customer_id: workOrder?.customer_id ? String(workOrder.customer_id) : defaults?.customer_id ? String(defaults.customer_id) : '',
        customer_site_id: workOrder?.customer_site_id ? String(workOrder.customer_site_id) : defaults?.customer_site_id ? String(defaults.customer_site_id) : '',
        service_type: workOrder?.service_type ?? '',
        scheduled_date: workOrder?.scheduled_date ?? defaults?.scheduled_date ?? '',
        priority: workOrder?.priority ?? defaults?.priority ?? 'normal',
        status: workOrder?.status ?? defaults?.status ?? 'draft',
        summary: workOrder?.summary ?? defaults?.summary ?? '',
        findings: workOrder?.findings ?? defaults?.findings ?? '',
    });

    const isCreate = workOrder === undefined;
    const availableSiteOptions =
        form.data.customer_id === ''
            ? []
            : siteOptions.filter((option) => option.customer_id === Number(form.data.customer_id));
    const availableQuotationOptions =
        form.data.customer_id === ''
            ? quotationOptions
            : quotationOptions.filter((option) => option.customer_id === Number(form.data.customer_id));
    const availableProjectOptions =
        form.data.customer_id === ''
            ? projectOptions
            : projectOptions.filter((option) => option.customer_id === Number(form.data.customer_id));
    const selectedCustomer = customerOptions.find(
        (option) => String(option.value) === form.data.customer_id,
    );
    const selectedSite = siteOptions.find(
        (option) => String(option.value) === form.data.customer_site_id,
    );
    const selectedQuotation = quotationOptions.find(
        (option) => String(option.value) === form.data.quotation_id,
    );
    const selectedProject = projectOptions.find(
        (option) => String(option.value) === form.data.project_id,
    );

    function handleCustomerChange(customerId: string) {
        form.setData('customer_id', customerId);

        const nextSiteOptions =
            customerId === ''
                ? []
                : siteOptions.filter((option) => option.customer_id === Number(customerId));
        const nextQuotationOptions =
            customerId === ''
                ? quotationOptions
                : quotationOptions.filter((option) => option.customer_id === Number(customerId));
        const nextProjectOptions =
            customerId === ''
                ? projectOptions
                : projectOptions.filter((option) => option.customer_id === Number(customerId));

        if (!nextSiteOptions.some((option) => String(option.value) === form.data.customer_site_id)) {
            form.setData('customer_site_id', '');
        }

        if (!nextQuotationOptions.some((option) => String(option.value) === form.data.quotation_id)) {
            form.setData('quotation_id', '');
        }

        if (!nextProjectOptions.some((option) => String(option.value) === form.data.project_id)) {
            form.setData('project_id', '');
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
            form.setData('customer_site_id', String(selectedQuotation.customer_site_id));
        }
    }

    function handleProjectChange(projectId: string) {
        form.setData('project_id', projectId);

        if (projectId === '') {
            return;
        }

        const selectedProject = projectOptions.find((option) => String(option.value) === projectId);

        if (!selectedProject) {
            return;
        }

        form.setData('customer_id', String(selectedProject.customer_id));
        form.setData('customer_site_id', String(selectedProject.customer_site_id));

        if (selectedProject.quotation_id) {
            form.setData('quotation_id', String(selectedProject.quotation_id));
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => {
            const payload = {
                work_order_no: data.work_order_no,
                quotation_id: data.quotation_id === '' ? null : Number(data.quotation_id),
                project_id: data.project_id === '' ? null : Number(data.project_id),
                customer_id: data.customer_id === '' ? null : Number(data.customer_id),
                customer_site_id:
                    data.customer_site_id === '' ? null : Number(data.customer_site_id),
                service_type: data.service_type,
                scheduled_date: data.scheduled_date || null,
                priority: data.priority,
                summary: data.summary,
                findings: data.findings || null,
            };

            if (!isCreate) {
                return payload;
            }

            return {
                ...payload,
                status: data.status,
            };
        });

        if (workOrder) {
            form.submit(WorkOrderController.update(workOrder.id), { preserveScroll: true });

            return;
        }

        form.submit(WorkOrderController.store(), { preserveScroll: true });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Work order details</CardTitle>
                        <CardDescription>
                            Register service or execution work tied to the correct customer, site, quotation, and project context.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="work_order_no">Work order number</Label>
                            <Input
                                id="work_order_no"
                                value={form.data.work_order_no}
                                onChange={(event) => form.setData('work_order_no', event.currentTarget.value)}
                                placeholder="WO-00001"
                            />
                            <InputError message={form.errors.work_order_no} />
                        </div>

                        {isCreate && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Initial status</Label>
                                <select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.currentTarget.value)}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.status} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="project_id">Project</Label>
                            <select
                                id="project_id"
                                value={form.data.project_id}
                                onChange={(event) => handleProjectChange(event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">No project linked</option>
                                {availableProjectOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-muted-foreground">
                                Selecting a project pulls in its customer, site, and linked quotation when one exists.
                            </p>
                            <InputError message={form.errors.project_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quotation_id">Awarded quotation</Label>
                            <select
                                id="quotation_id"
                                value={form.data.quotation_id}
                                onChange={(event) => handleQuotationChange(event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">No quotation linked</option>
                                {availableQuotationOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-muted-foreground">
                                Choose the quotation first when this work order comes straight from an awarded sales handoff.
                            </p>
                            <InputError message={form.errors.quotation_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <select
                                id="customer_id"
                                value={form.data.customer_id}
                                onChange={(event) => handleCustomerChange(event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Select customer</option>
                                {customerOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-muted-foreground">
                                Changing the customer narrows the site, project, and quotation choices to that account.
                            </p>
                            <InputError message={form.errors.customer_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_site_id">Site</Label>
                            <select
                                id="customer_site_id"
                                value={form.data.customer_site_id}
                                onChange={(event) => form.setData('customer_site_id', event.currentTarget.value)}
                                disabled={form.data.customer_id === ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">
                                    {form.data.customer_id === '' ? 'Select customer first' : 'Select site'}
                                </option>
                                {availableSiteOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-muted-foreground">
                                Keep the site in sync with the selected project or quotation so field work lands on the right record.
                            </p>
                            <InputError message={form.errors.customer_site_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_type">Service type</Label>
                            <select
                                id="service_type"
                                value={form.data.service_type}
                                onChange={(event) => form.setData('service_type', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">Select service type</option>
                                {serviceTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.service_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="scheduled_date">Scheduled date</Label>
                            <Input
                                id="scheduled_date"
                                type="date"
                                value={form.data.scheduled_date}
                                onChange={(event) => form.setData('scheduled_date', event.currentTarget.value)}
                            />
                            <InputError message={form.errors.scheduled_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <select
                                id="priority"
                                value={form.data.priority}
                                onChange={(event) => form.setData('priority', event.currentTarget.value)}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                {priorityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.priority} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="summary">Summary</Label>
                            <Input
                                id="summary"
                                value={form.data.summary}
                                onChange={(event) => form.setData('summary', event.currentTarget.value)}
                                placeholder="Annual preventive maintenance service"
                            />
                            <InputError message={form.errors.summary} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="findings">Findings / notes</Label>
                            <Textarea
                                id="findings"
                                value={form.data.findings}
                                onChange={(event) => form.setData('findings', event.currentTarget.value)}
                                rows={5}
                                placeholder="Initial context, service scope, or known findings."
                            />
                            <InputError message={form.errors.findings} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Linkage summary</CardTitle>
                        <CardDescription>
                            Confirm the execution record is being created under the right upstream context.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Project
                            </p>
                            <p className="mt-1 font-medium">
                                {selectedProject?.label ?? 'No project linked'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Awarded quotation
                            </p>
                            <p className="mt-1 font-medium">
                                {selectedQuotation?.label ?? 'No quotation linked'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Customer
                            </p>
                            <p className="mt-1 font-medium">
                                {selectedCustomer?.label ?? 'Select a customer'}
                            </p>
                        </div>

                        <div className="rounded-lg border border-dashed px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                            Start from the project when execution belongs to an active project, or use the quotation when the work order needs to bypass project setup.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Save work order</CardTitle>
                        <CardDescription>
                            Status progression, technician notes, and material tracking continue on the detail page.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button className="w-full" disabled={form.processing}>
                            {form.processing
                                ? workOrder
                                    ? 'Saving changes...'
                                    : 'Creating work order...'
                                : workOrder
                                  ? 'Save changes'
                                  : 'Create work order'}
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
