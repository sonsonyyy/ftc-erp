import { Form, Link, type InertiaLinkProps } from '@inertiajs/react';
import { ExportCsvButton } from '@/components/export-csv-button';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
    action: NonNullable<InertiaLinkProps['href']>;
    resetHref: NonNullable<InertiaLinkProps['href']>;
    exportHref?: NonNullable<InertiaLinkProps['href']>;
    title?: string;
    description: string;
    activeFilterCount?: number;
    fieldsClassName?: string;
    children: ReactNode;
};

export function IndexFiltersCard({
    action,
    resetHref,
    exportHref,
    title = 'Filters',
    description,
    activeFilterCount = 0,
    fieldsClassName,
    children,
}: Props) {
    const hasActiveFilters = activeFilterCount > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {hasActiveFilters && (
                    <p className="text-xs text-muted-foreground">
                        {activeFilterCount} active filter
                        {activeFilterCount === 1 ? '' : 's'}
                    </p>
                )}
            </CardHeader>

            <CardContent>
                <Form
                    action={action}
                    method="get"
                    options={{ preserveState: true, replace: true }}
                    className="space-y-3"
                >
                    <div className={cn('grid gap-3', fieldsClassName)}>
                        {children}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit">Apply filters</Button>

                        {hasActiveFilters && (
                            <Button variant="outline" asChild>
                                <Link href={resetHref}>Reset</Link>
                            </Button>
                        )}

                        {exportHref && <ExportCsvButton href={exportHref} />}
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
