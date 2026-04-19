import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as projectsIndex } from '@/routes/projects';
import { ProjectForm } from '@/components/projects/project-form';
import type {
    ProjectFormDefaults,
    ProjectQuotationOption,
    ProjectSiteOption,
    SelectOption,
} from '@/types';

type Props = {
    customerOptions: SelectOption[];
    siteOptions: ProjectSiteOption[];
    quotationOptions: ProjectQuotationOption[];
    statusOptions: SelectOption[];
    defaults: ProjectFormDefaults;
};

export default function ProjectsCreate({
    customerOptions,
    siteOptions,
    quotationOptions,
    statusOptions,
    defaults,
}: Props) {
    return (
        <>
            <Head title="New Project" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <ProjectForm
                    customerOptions={customerOptions}
                    siteOptions={siteOptions}
                    quotationOptions={quotationOptions}
                    statusOptions={statusOptions}
                    defaults={defaults}
                    title="New project"
                    description="Register the operations project record that will anchor schedules, assignments, and downstream work orders."
                    cancelHref={projectsIndex()}
                />
            </div>
        </>
    );
}

ProjectsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Projects', href: projectsIndex() },
        { title: 'New project', href: projectsIndex() },
    ],
};
