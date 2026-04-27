import type { ReactNode } from 'react';
import { PaginationLinks } from '@/components/pagination-links';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

type Props<T> = {
    title?: ReactNode;
    description?: ReactNode;
    pagination?: PaginatedData<T>;
    className?: string;
    contentClassName?: string;
    children: ReactNode;
};

export function DataTableCard<T>({
    title,
    description,
    pagination,
    className,
    contentClassName,
    children,
}: Props<T>) {
    return (
        <Card
            className={cn(
                'overflow-hidden border-border/70 shadow-sm',
                className,
            )}
        >
            {(title || description) && (
                <CardHeader className="gap-0.5 border-b px-5 py-3.5">
                    {title && (
                        <CardTitle className="text-sm font-semibold tracking-tight">
                            {title}
                        </CardTitle>
                    )}
                    {description && (
                        <CardDescription>{description}</CardDescription>
                    )}
                </CardHeader>
            )}

            <CardContent className={cn('px-0', contentClassName)}>
                <div
                    className={cn(
                        'overflow-x-auto',
                        '[&_table]:w-full [&_table]:min-w-full [&_table]:text-sm',
                        '[&_thead_tr]:border-b [&_thead_tr]:text-left [&_thead_tr]:text-muted-foreground',
                        '[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:align-middle [&_th]:text-[11px] [&_th]:font-medium [&_th]:tracking-[0.18em] [&_th]:uppercase',
                        '[&_tbody_tr]:border-b [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/25',
                        '[&_tbody_tr:last-child]:border-b-0',
                        '[&_td]:px-5 [&_td]:py-3.5 [&_td]:align-top',
                    )}
                >
                    {children}
                </div>
            </CardContent>

            {pagination && <PaginationLinks pagination={pagination} />}
        </Card>
    );
}
