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
    title: string;
    description: ReactNode;
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
            <CardHeader className="gap-1 border-b bg-muted/20 px-6 py-5">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className={cn('px-0', contentClassName)}>
                <div
                    className={cn(
                        'overflow-x-auto',
                        '[&_table]:w-full [&_table]:min-w-full [&_table]:text-sm',
                        '[&_thead_tr]:border-b [&_thead_tr]:text-left [&_thead_tr]:text-muted-foreground',
                        '[&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:align-middle [&_th]:text-xs [&_th]:font-medium [&_th]:tracking-wide [&_th]:uppercase',
                        '[&_tbody_tr]:border-b [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/25',
                        '[&_tbody_tr:last-child]:border-b-0',
                        '[&_td]:px-6 [&_td]:py-4 [&_td]:align-top',
                    )}
                >
                    {children}
                </div>
            </CardContent>

            {pagination && <PaginationLinks pagination={pagination} />}
        </Card>
    );
}
