import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ClearableSearchInput } from '@/components/clearable-search-input';
import { CompactDataTable } from '@/components/compact-data-table';
import { DataTablePaginationFooter } from '@/components/data-table-pagination-footer';
import { DataTableRowActions } from '@/components/data-table-row-actions';
import { FilterSelect } from '@/components/filter-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    ProjectListItem,
    SelectOption,
} from '@/types';

type Props = {
    projects: PaginatedData<ProjectListItem>;
    filters: ProjectFilters;
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
    filters,
    statusOptions,
    can,
}: Props) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [tableFilters, setTableFilters] = useState({
        status: filters.status,
        per_page: String(filters.per_page),
    });

    useEffect(() => {
        const syncFilters = window.setTimeout(() => {
            setTableFilters((currentFilters) => {
                const nextFilters = {
                    status: filters.status,
                    per_page: String(filters.per_page),
                };

                if (
                    currentFilters.status === nextFilters.status &&
                    currentFilters.per_page === nextFilters.per_page
                ) {
                    return currentFilters;
                }

                return nextFilters;
            });
        }, 0);

        return () => window.clearTimeout(syncFilters);
    }, [filters.per_page, filters.status]);

    useEffect(() => {
        const normalizedSearch = searchInput.trim();
        const currentPerPage = String(filters.per_page);

        if (
            normalizedSearch === filters.search &&
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
                    status: tableFilters.status,
                    per_page: Number(tableFilters.per_page),
                    page: 1,
                }),
                {
                    only: ['projects', 'filters'],
                    replace: true,
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [
        filters.per_page,
        filters.search,
        filters.status,
        searchInput,
        tableFilters,
    ]);

    return (
        <>
            <Head title="Projects" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Projects
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage awarded jobs before execution starts.
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <ClearableSearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            placeholder="Search projects or customers"
                        />

                        <FilterSelect
                            value={tableFilters.status}
                            onChange={(event) => {
                                router.cancelAll();
                                setTableFilters((currentFilters) => ({
                                    ...currentFilters,
                                    status: event.currentTarget.value,
                                }));
                            }}
                            className="w-full sm:w-[180px]"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={String(option.value)}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>

                    {can.create ? (
                        <Button asChild className="lg:shrink-0">
                            <Link href={projectsCreate()}>
                                <Plus />
                                New project
                            </Link>
                        </Button>
                    ) : null}
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
                                <th>Number</th>
                                <th>Customer / site</th>
                                <th>Title / type</th>
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
                                        colSpan={8}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        No projects matched the current filters.
                                    </td>
                                </tr>
                            )}

                            {projects.data.map((project) => (
                                <tr key={project.id}>
                                    <td className="text-[13px] text-muted-foreground">
                                        <p className="max-w-[10rem] truncate">
                                            {project.project_no}
                                        </p>
                                    </td>

                                    <td>
                                        <p className="max-w-[18rem] truncate font-medium text-foreground">
                                            {project.customer.company_name ??
                                                'Unlinked customer'}
                                        </p>
                                        <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                            {[
                                                project.customer.customer_code,
                                                project.site.site_name,
                                            ]
                                                .filter(Boolean)
                                                .join(' - ') ||
                                                'No site linked'}
                                        </p>
                                    </td>

                                    <td>
                                        <div className="space-y-0.5">
                                            <p className="max-w-[18rem] truncate font-medium text-foreground">
                                                {project.title}
                                            </p>
                                            <p className="max-w-[18rem] truncate text-[13px] text-muted-foreground">
                                                {project.project_type}
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
                                                resourceLabel="project"
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
