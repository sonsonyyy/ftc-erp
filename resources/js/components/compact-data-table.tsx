import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    tableWrapperClassName?: string;
};

export function CompactDataTable({
    children,
    footer,
    className,
    tableWrapperClassName,
}: Props) {
    return (
        <Card
            className={cn(
                'gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-sm',
                className,
            )}
        >
            <div
                className={cn(
                    'overflow-x-auto',
                    '[&_table]:w-full [&_table]:min-w-full [&_table]:text-sm',
                    '[&_thead_tr]:border-b [&_thead_tr]:bg-muted/45 [&_thead_tr]:text-left [&_thead_tr]:text-muted-foreground',
                    '[&_th]:px-5 [&_th]:py-3.5 [&_th]:align-middle [&_th]:text-[11px] [&_th]:font-medium [&_th]:tracking-[0.18em] [&_th]:uppercase',
                    '[&_tbody_tr]:border-b',
                    '[&_tbody_tr:last-child]:border-b-0',
                    '[&_tbody_tr:nth-child(odd)>td]:bg-muted/[0.16]',
                    '[&_tbody_tr:hover>td]:bg-primary/[0.06]',
                    '[&_td]:px-5 [&_td]:py-3 [&_td]:align-middle [&_td]:transition-colors',
                    tableWrapperClassName,
                )}
            >
                {children}
            </div>

            {footer}
        </Card>
    );
}
