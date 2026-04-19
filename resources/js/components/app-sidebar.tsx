import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    ClipboardCheck,
    ClipboardList,
    FolderKanban,
    LayoutGrid,
    MapPinned,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import { index as projectsIndex } from '@/routes/projects';
import { index as quotationsIndex } from '@/routes/quotations';
import { index as sitesIndex } from '@/routes/sites';
import { index as usersIndex } from '@/routes/users';
import { index as workOrdersIndex } from '@/routes/work-orders';
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Users',
        href: usersIndex(),
        icon: Users,
        permission: 'users.view',
    },
    {
        title: 'Customers',
        href: customersIndex(),
        icon: Building2,
        permission: 'customers.view',
    },
    {
        title: 'Sites',
        href: sitesIndex(),
        icon: MapPinned,
        permission: 'sites.view',
    },
    {
        title: 'Quotations',
        href: quotationsIndex(),
        icon: ClipboardList,
        permission: 'quotations.view',
    },
    {
        title: 'Projects',
        href: projectsIndex(),
        icon: FolderKanban,
        permission: 'projects.view',
    },
    {
        title: 'Work Orders',
        href: workOrdersIndex(),
        icon: ClipboardCheck,
        permission: 'work_orders.view',
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };
    const visibleMainNavItems = mainNavItems.filter(
        (item) => item.permission === undefined || auth.permissions.includes(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleMainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
