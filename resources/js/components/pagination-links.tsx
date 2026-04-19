import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { PaginatedData } from '@/types';

type Props<T> = {
    pagination: PaginatedData<T>;
};

export function PaginationLinks<T>({ pagination }: Props<T>) {
    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{' '}
                {pagination.total} records
            </p>

            <div className="flex flex-wrap items-center gap-2">
                {pagination.links.map((link) => {
                    const url = link.url;
                    const isDisabled = url === null;

                    if (isDisabled) {
                        return (
                            <Button
                                key={link.label}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Button
                            key={url}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild
                        >
                            <Link
                                href={url}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
