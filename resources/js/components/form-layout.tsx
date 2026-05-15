import type { ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FormStepItem = {
    step: string;
    title: string;
    caption?: string;
};

export function FormPageHeader({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <header className="space-y-1.5">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
                <p className="max-w-3xl text-[13px] leading-5 text-muted-foreground">
                    {description}
                </p>
            ) : null}
        </header>
    );
}

export function FormSteps({
    items,
    className,
}: {
    items: FormStepItem[];
    className?: string;
}) {
    return (
        <div
            className={cn(
                'grid gap-2 md:grid-cols-3 xl:grid-flow-col xl:grid-cols-none',
                className,
            )}
        >
            {items.map((item) => (
                <div
                    key={item.step}
                    className="rounded-xl border bg-muted/10 px-3 py-2.5"
                >
                    <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Step {item.step}
                    </p>
                    <p className="mt-1 text-sm font-medium">{item.title}</p>
                    {item.caption ? (
                        <p className="mt-0.5 text-[11px] leading-4.5 text-muted-foreground">
                            {item.caption}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export function FormSectionCard({
    step,
    title,
    description,
    children,
    className,
    contentClassName,
}: {
    step: string;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}) {
    return (
        <Card className={cn('gap-3 py-4', className)}>
            <CardHeader className="space-y-1 px-4 pb-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                        Step {step}
                    </span>
                    <CardTitle className="text-[15px]">{title}</CardTitle>
                </div>
                {description ? (
                    <CardDescription className="text-[12px] leading-5">
                        {description}
                    </CardDescription>
                ) : null}
            </CardHeader>
            <CardContent className={cn('px-4', contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}

export function FormSidebarCard({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}) {
    return (
        <Card className={cn('gap-3 py-4', className)}>
            <CardHeader className="space-y-1 px-4 pb-0">
                <CardTitle className="text-[15px]">{title}</CardTitle>
                {description ? (
                    <CardDescription className="text-[12px] leading-5">
                        {description}
                    </CardDescription>
                ) : null}
            </CardHeader>
            {children ? (
                <CardContent className="px-4">{children}</CardContent>
            ) : null}
        </Card>
    );
}
