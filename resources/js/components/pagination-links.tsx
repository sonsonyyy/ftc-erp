import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

type Props<T> = {
    pagination: PaginatedData<T>;
};

export function PaginationLinks<T>({ pagination }: Props<T>) {
    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 border-t bg-muted/10 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                    Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{' '}
                    {pagination.total} records
                </p>
                <p className="text-xs text-muted-foreground">
                    Page {pagination.current_page} of {pagination.last_page}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-1">
                {pagination.links.map((link) => {
                    const url = link.url;
                    const isDisabled = url === null;
                    const isActive = link.active;

                    if (isDisabled) {
                        return (
                            <Button
                                key={link.label}
                                variant="outline"
                                size="sm"
                                disabled
                                className="min-w-9 rounded-full px-3 text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    return (
                        <Button
                            key={url}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'min-w-9 rounded-full px-3',
                                !isActive && 'bg-background',
                            )}
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
