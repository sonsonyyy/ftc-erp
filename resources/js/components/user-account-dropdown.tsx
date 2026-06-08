import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { UserMenuContent } from '@/components/user-menu-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

export function UserAccountDropdown({ className }: { className?: string }) {
    const { auth } = usePage().props as { auth: Auth };
    const getInitials = useInitials();

    if (!auth.user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        'h-9 justify-start gap-2 rounded-md px-2.5 text-left hover:bg-muted',
                        className,
                    )}
                >
                    <Avatar className="size-7">
                        <AvatarImage
                            src={auth.user.avatar}
                            alt={auth.user.name}
                        />
                        <AvatarFallback className="bg-neutral-200 text-[11px] text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-36 truncate text-[12px] font-medium text-foreground md:block">
                        {auth.user.name}
                    </span>
                    <ChevronsUpDown className="hidden size-3.5 text-muted-foreground md:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
