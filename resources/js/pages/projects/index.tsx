import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as projectsCreate, index as projectsIndex, show as projectsShow } from '@/routes/projects';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type {
    PaginatedData,
    ProjectFilters,
    ProjectListItem,
    SelectOption,
} from '@/types';

type Props = {
    projects: PaginatedData<ProjectListItem>;
    filters: ProjectFilters;
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

function formatDate(date: string | null): string {
    if (!date) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function statusBadgeClass(status: string): string {
    return {
        draft: 'border-slate-200 bg-slate-100 text-slate-700',
        open: 'border-sky-200 bg-sky-50 text-sky-700',
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        on_hold: 'border-orange-200 bg-orange-50 text-orange-700',
        completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function ProjectsIndex({
    projects,
    filters,
    customerOptions,
    statusOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Projects" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage awarded-job delivery records before scheduling detailed service and execution work.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={projectsCreate()}>New project</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by project number, title, type, customer, or site.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={projectsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1.3fr_1fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search projects"
                            />

                            <select
                                name="customer"
                                defaultValue={filters.customer ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All customers</option>
                                {customerOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="status"
                                defaultValue={filters.status}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All statuses</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={projectsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Project registry</CardTitle>
                        <CardDescription>{projects.total} project records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Project</th>
                                    <th className="px-6 py-3 font-medium">Customer / site</th>
                                    <th className="px-6 py-3 font-medium">Dates</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Linked work</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {projects.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No projects matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {projects.data.map((project) => (
                                    <tr key={project.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{project.project_no}</p>
                                                <p className="text-muted-foreground">{project.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Type: {project.project_type}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>
                                                    {project.customer.customer_code} -{' '}
                                                    {project.customer.company_name}
                                                </p>
                                                <p>{project.site.site_name ?? 'No site linked'}</p>
                                                {project.quotation.quotation_no && (
                                                    <p className="text-xs">
                                                        Quote: {project.quotation.quotation_no}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>Start: {formatDate(project.start_date)}</p>
                                                <p>Target end: {formatDate(project.target_end_date)}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClass(project.status)}
                                            >
                                                {project.status_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{project.work_order_count} work orders</p>
                                                <p>{project.attachment_count} attachments</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {project.can.view && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={projectsShow(project.id)}>Open</Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={projects} />
                </Card>
            </div>
        </>
    );
}

ProjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Projects', href: projectsIndex() },
    ],
};
