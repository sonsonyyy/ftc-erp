import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    index as projectsIndex,
    show as projectsShow,
} from '@/routes/projects';
import { ProjectForm } from '@/components/projects/project-form';
import type {
    ProjectDetail,
    ProjectQuotationOption,
    ProjectSiteOption,
    SelectOption,
} from '@/types';

type Props = {
    project: ProjectDetail;
    customerOptions: SelectOption[];
    siteOptions: ProjectSiteOption[];
    quotationOptions: ProjectQuotationOption[];
};

export default function ProjectsEdit({
    project,
    customerOptions,
    siteOptions,
    quotationOptions,
}: Props) {
    return (
        <>
            <Head title={`Edit ${project.project_no}`} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <ProjectForm
                    project={project}
                    customerOptions={customerOptions}
                    siteOptions={siteOptions}
                    quotationOptions={quotationOptions}
                    title={`Edit ${project.project_no}`}
                    description="Adjust the project master record while keeping status progression and staffing history on the detail page."
                    cancelHref={projectsShow(project.id)}
                />
            </div>
        </>
    );
}

ProjectsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Projects', href: projectsIndex() },
        { title: 'Edit project', href: projectsIndex() },
    ],
};
