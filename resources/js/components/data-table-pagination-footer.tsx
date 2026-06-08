import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

type Props<T> = {
    pagination: PaginatedData<T>;
    perPage: string;
    perPageOptions: readonly string[];
    onPerPageChange: (value: string) => void;
    className?: string;
};

export function DataTablePaginationFooter<T>({
    pagination,
    perPage,
    perPageOptions,
    onPerPageChange,
    className,
}: Props<T>) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-t bg-muted/45 px-5 py-3 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Select value={perPage} onValueChange={onPerPageChange}>
                    <SelectTrigger
                        size="sm"
                        aria-label="Rows per page"
                        className="w-[122px] bg-background"
                    >
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent position="item-aligned">
                        {perPageOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option} per page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <p className="text-[13px] text-muted-foreground">
                    Showing {pagination.from ?? 0}-{pagination.to ?? 0} of{' '}
                    {pagination.total}
                </p>
            </div>

            {pagination.links.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-1">
                    {pagination.links.map((link, index) => {
                        const href = link.url;

                        if (href === null) {
                            return (
                                <Button
                                    key={`${link.label}-${index}`}
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="h-8 min-w-8 rounded-md px-2.5 text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        }

                        return (
                            <Button
                                key={`${href}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 min-w-8 rounded-md px-2.5"
                                asChild
                            >
                                <Link
                                    href={href}
                                    preserveScroll
                                    preserveState
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            </Button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
