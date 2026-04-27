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
        <div className="flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-muted-foreground">
                Showing {pagination.from ?? 0}-{pagination.to ?? 0} of{' '}
                {pagination.total}
            </p>

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
                                className="min-w-9 rounded-lg px-3 text-muted-foreground"
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
                                'min-w-9 rounded-lg px-3',
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
