import { Fragment } from 'react';
import { Link, type InertiaLinkProps } from '@inertiajs/react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
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
};

export function DataTableRowActions({
    items,
    label = 'Open row actions',
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
                    className="size-8 rounded-lg text-muted-foreground"
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
                                        {item.label}
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
                                {item.label}
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
