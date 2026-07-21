import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActionItem = {
    key: string;
    label: string;
    icon: LucideIcon;
    href?: NonNullable<InertiaLinkProps['href']>;
    onSelect?: () => void;
    destructive?: boolean;
};

type Props = {
    items: ActionItem[];
    label?: string;
    resourceLabel?: string;
};

function normalizeActionLabel(label: string, resourceLabel?: string): string {
    if (!resourceLabel) {
        return label;
    }

    const normalizedResourceLabel = resourceLabel.trim().toLowerCase();

    switch (label) {
        case 'Open':
            return `Open ${normalizedResourceLabel}`;
        case 'Edit':
            return `Edit ${normalizedResourceLabel}`;
        case 'Archive':
            return `Archive ${normalizedResourceLabel}`;
        default:
            return label;
    }
}

export function DataTableRowActions({
    items,
    label = 'Open row actions',
    resourceLabel,
}: Props) {
    if (items.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-md text-muted-foreground"
                    aria-label={label}
                >
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
                {items.map((item, index) => {
                    const Icon = item.icon;

                    if (item.href) {
                        return (
                            <Fragment key={item.key}>
                                <DropdownMenuItem asChild>
                                    <Link href={item.href}>
                                        <Icon />
                                        {normalizeActionLabel(
                                            item.label,
                                            resourceLabel,
                                        )}
                                    </Link>
                                </DropdownMenuItem>

                                {index < items.length - 1 && (
                                    <DropdownMenuSeparator />
                                )}
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment key={item.key}>
                            <DropdownMenuItem
                                variant={
                                    item.destructive ? 'destructive' : 'default'
                                }
                                onSelect={item.onSelect}
                            >
                                <Icon />
                                {normalizeActionLabel(
                                    item.label,
                                    resourceLabel,
                                )}
                            </DropdownMenuItem>

                            {index < items.length - 1 && (
                                <DropdownMenuSeparator />
                            )}
                        </Fragment>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
