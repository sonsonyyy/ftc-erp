import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    BadgeCheck,
    ChevronDown,
    ClipboardList,
    Clock3,
    Download,
    Ellipsis,
    Eye,
    FolderKanban,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cleanQueryParams, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    create as projectsCreate,
    destroy as projectsDestroy,
    edit as projectsEdit,
    index as projectsIndex,
    show as projectsShow,
} from '@/routes/projects';
import type {
    PaginatedData,
    ProjectFilters,
    ProjectIndexSummary,
    ProjectListItem,
    SelectOption,
} from '@/types';

type Props = {
    projects: PaginatedData<ProjectListItem>;
    summary: ProjectIndexSummary;
    filters: ProjectFilters;
    customerOptions: SelectOption[];
    statusOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

const projectBreadcrumbs = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Projects',
        href: projectsIndex(),
    },
];

const perPageOptions = ['5', '10', '15', '25'];

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
    return (
        {
            draft: 'border-slate-200 bg-slate-100 text-slate-700',
            open: 'border-sky-200 bg-sky-50 text-sky-700',
            in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
            on_hold: 'border-orange-200 bg-orange-50 text-orange-700',
            completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
        }[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function ProjectsIndex({
    projects,
    summary,
    filters,
    customerOptions,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        customer: filters.customer === null ? '' : String(filters.customer),
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        setTableFilters((currentFilters) => {
            const nextFilters = {
                customer:
                    filters.customer === null ? '' : String(filters.customer),
                status: filters.status,
                per_page: String(filters.per_page),
            };

            if (
                currentFilters.customer === nextFilters.customer &&
                currentFilters.status === nextFilters.status &&
                currentFilters.per_page === nextFilters.per_page
            ) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [filters.customer, filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentCustomer =
            filters.customer === null ? '' : String(filters.customer);
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
            tableFilters.customer === currentCustomer &&
            tableFilters.status === filters.status &&
            tableFilters.per_page === currentPerPage
        ) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.cancelAll();
            router.get(
                toUrl(projectsIndex()),
                cleanQueryParams({
                    search: normalizedSearch,
                    customer:
                        tableFilters.customer === ''
                            ? undefined
                            : Number(tableFilters.customer),
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['projects', 'filters', 'summary'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.customer,
        filters.per_page,
        filters.search,
        filters.status,
        searchInput,
        tableFilters,
    ]);

    const activeFilterCount =
        (tableFilters.customer === '' ? 0 : 1) +
        (tableFilters.status === '' ? 0 : 1);
    const exportHref = projectsIndex({
        query: cleanQueryParams({
            search: searchInput.trim(),
            customer:
                tableFilters.customer === ''
                    ? undefined
                    : Number(tableFilters.customer),
            status: tableFilters.status,
            export: 'csv',
        }),
    });
    const summaryCards = [
        {
            title: 'Total projects',
            value: summary.total_projects,
            icon: FolderKanban,
            iconClassName: 'bg-sky-50 text-sky-700',
        },
        {
            title: 'Active projects',
            value: summary.active_projects,
            icon: Clock3,
            iconClassName: 'bg-amber-50 text-amber-700',
        },
        {
            title: 'Completed',
            value: summary.completed_projects,
            icon: BadgeCheck,
            iconClassName: 'bg-emerald-50 text-emerald-700',
        },
        {
            title: 'Linked work orders',
            value: summary.linked_work_orders,
            icon: ClipboardList,
            iconClassName: 'bg-indigo-50 text-indigo-700',
        },
    ];

    return (
        <>
            <Head title="Projects" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Projects
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage awarded jobs before execution starts.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={projectsCreate()}>
                                <Plus />
                                New project
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card
                                key={card.title}
                                className="border-border/70 py-4 shadow-sm"
                            >
                                <CardContent className="flex items-center gap-3">
                                    <div
                                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <CardDescription>
                                            {card.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl tracking-tight">
                                            {card.value}
                                        </CardTitle>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.currentTarget.value)
                                }
                                placeholder="Search projects"
                                className="h-9 pl-9"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 bg-background"
                                >
                                    <SlidersHorizontal />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={
                                        tableFilters.status === ''
                                            ? 'all'
                                            : tableFilters.status
                                    }
                                    onValueChange={(value) => {
                                        router.cancelAll();
                                        setTableFilters((currentFilters) => ({
                                            ...currentFilters,
                                            status:
                                                value === 'all' ? '' : value,
                                        }));
                                    }}
                                >
                                    <DropdownMenuRadioItem value="all">
                                        All statuses
                                    </DropdownMenuRadioItem>
                                    {statusOptions.map((option) => (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={String(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        Customer
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="max-h-80 w-72 overflow-y-auto">
                                        <DropdownMenuRadioGroup
                                            value={
                                                tableFilters.customer === ''
                                                    ? 'all'
                                                    : tableFilters.customer
                                            }
                                            onValueChange={(value) => {
                                                router.cancelAll();
                                                setTableFilters(
                                                    (currentFilters) => ({
                                                        ...currentFilters,
                                                        customer:
                                                            value === 'all'
                                                                ? ''
                                                                : value,
                                                    }),
                                                );
                                            }}
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All customers
                                            </DropdownMenuRadioItem>
                                            {customerOptions.map((option) => (
                                                <DropdownMenuRadioItem
                                                    key={option.value}
                                                    value={String(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 bg-background"
                            >
                                <Ellipsis />
                                Actions
                                <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <a href={toUrl(exportHref)}>
                                    <Download />
                                    Export CSV
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CompactDataTable
                    footer={
                        <DataTablePaginationFooter
                            pagination={projects}
                            perPage={tableFilters.per_page}
                            perPageOptions={perPageOptions}
                            onPerPageChange={(value) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    per_page: value,
                                }));
                            }}
                        />
                    }
                >
                    <table>
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Customer / site</th>
                                <th>Dates</th>
                                <th>Status</th>
                                <th className="text-right">Work orders</th>
                                <th className="text-right">Attachments</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {projects.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No projects matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {projects.data.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[16rem] truncate font-semibold text-foreground">
                                                {project.project_no}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    project.title,
                                                    project.project_type,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {project.customer
                                                    .company_name ??
                                                    'Unlinked customer'}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {[
                                                    project.customer
                                                        .customer_code,
                                                    project.site.site_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ') ||
                                                    'No site linked'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="text-[13px] text-muted-foreground">
                                        <div className="space-y-0.5 leading-5">
                                            <p className="max-w-[14rem] truncate">
                                                Start:{' '}
                                                {formatDate(project.start_date)}
                                            </p>
                                            <p className="max-w-[14rem] truncate">
                                                Target end:{' '}
                                                {formatDate(
                                                    project.target_end_date,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <Badge
                                            variant="outline"
                                            className={statusBadgeClass(
                                                project.status,
                                            )}
                                        >
                                            {project.status_label}
                                        </Badge>
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {project.work_order_count}
                                    </td>

                                    <td className="text-right font-medium tabular-nums">
                                        {project.attachment_count}
                                    </td>

                                    <td className="text-right">
                                        <div className="flex justify-end">
                                            <DataTableRowActions
                                                items={[
                                                    ...(project.can.view
                                                        ? [
                                                              {
                                                                  key: 'open',
                                                                  label: 'Open',
                                                                  icon: Eye,
                                                                  href: projectsShow(
                                                                      project.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(project.can.update
                                                        ? [
                                                              {
                                                                  key: 'edit',
                                                                  label: 'Edit',
                                                                  icon: Pencil,
                                                                  href: projectsEdit(
                                                                      project.id,
                                                                  ),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(project.can.delete
                                                        ? [
                                                              {
                                                                  key: 'archive',
                                                                  label: 'Archive',
                                                                  icon: Archive,
                                                                  destructive: true,
                                                                  onSelect:
                                                                      () =>
                                                                          router.delete(
                                                                              toUrl(
                                                                                  projectsDestroy(
                                                                                      project.id,
                                                                                  ),
                                                                              ),
                                                                              {
                                                                                  preserveScroll: true,
                                                                              },
                                                                          ),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                                label={`Open actions for ${project.project_no}`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CompactDataTable>
            </div>
        </>
    );
}

ProjectsIndex.layout = {
    breadcrumbs: projectBreadcrumbs,
};
