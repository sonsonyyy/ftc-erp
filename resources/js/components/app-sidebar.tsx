import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    ClipboardCheck,
    ClipboardList,
    CreditCard,
    FileText,
    FolderKanban,
    LayoutGrid,
    MapPinned,
    Package,
    ScrollText,
    ShoppingCart,
    Truck,
    Users,
    Warehouse,
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
import { index as accountsReceivableIndex } from '@/routes/accounts-receivable';
import { index as customersIndex } from '@/routes/customers';
import { index as departmentsIndex } from '@/routes/departments';
import { index as employeesIndex } from '@/routes/employees';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as invoicesIndex } from '@/routes/invoices';
import { index as payrollRunsIndex } from '@/routes/payroll-runs';
import { index as positionsIndex } from '@/routes/positions';
import { index as purchaseOrdersIndex } from '@/routes/purchase-orders';
import { index as purchaseReceiptsIndex } from '@/routes/purchase-receipts';
import { index as purchaseRequestsIndex } from '@/routes/purchase-requests';
import { index as paymentsIndex } from '@/routes/payments';
import { index as projectsIndex } from '@/routes/projects';
import { index as quotationsIndex } from '@/routes/quotations';
import { index as sitesIndex } from '@/routes/sites';
import { index as stockIssuancesIndex } from '@/routes/stock-issuances';
import { index as stockMovementsIndex } from '@/routes/stock-movements';
import { index as stockReturnsIndex } from '@/routes/stock-returns';
import { index as suppliersIndex } from '@/routes/suppliers';
import { index as taxReportRunsIndex } from '@/routes/tax-report-runs';
import { index as usersIndex } from '@/routes/users';
import { index as warehousesIndex } from '@/routes/warehouses';
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
        title: 'Departments',
        href: departmentsIndex(),
        icon: Building2,
        permission: 'departments.view',
    },
    {
        title: 'Positions',
        href: positionsIndex(),
        icon: ClipboardList,
        permission: 'positions.view',
    },
    {
        title: 'Employees',
        href: employeesIndex(),
        icon: Users,
        permission: 'employees.view',
    },
    {
        title: 'Payroll Runs',
        href: payrollRunsIndex(),
        icon: ScrollText,
        permission: 'payroll_runs.view',
    },
    {
        title: 'Tax Reports',
        href: taxReportRunsIndex(),
        icon: FileText,
        permission: 'tax_report_runs.view',
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
    {
        title: 'Inventory',
        href: inventoryIndex(),
        icon: Package,
        permission: 'inventory.view',
    },
    {
        title: 'Warehouses',
        href: warehousesIndex(),
        icon: Warehouse,
        permission: 'warehouses.view',
    },
    {
        title: 'Stock Movements',
        href: stockMovementsIndex(),
        icon: ScrollText,
        permission: 'stock.view',
    },
    {
        title: 'Stock Issuances',
        href: stockIssuancesIndex(),
        icon: ScrollText,
        permission: 'stock.view',
    },
    {
        title: 'Stock Returns',
        href: stockReturnsIndex(),
        icon: ScrollText,
        permission: 'stock.view',
    },
    {
        title: 'Suppliers',
        href: suppliersIndex(),
        icon: Truck,
        permission: 'suppliers.view',
    },
    {
        title: 'Purchase Requests',
        href: purchaseRequestsIndex(),
        icon: ClipboardList,
        permission: 'purchase_requests.view',
    },
    {
        title: 'Purchase Orders',
        href: purchaseOrdersIndex(),
        icon: ShoppingCart,
        permission: 'purchase_orders.view',
    },
    {
        title: 'Purchase Receipts',
        href: purchaseReceiptsIndex(),
        icon: Package,
        permission: 'purchase_receipts.view',
    },
    {
        title: 'Invoices',
        href: invoicesIndex(),
        icon: FileText,
        permission: 'invoices.view',
    },
    {
        title: 'Payments',
        href: paymentsIndex(),
        icon: CreditCard,
        permission: 'payments.view',
    },
    {
        title: 'AR Aging',
        href: accountsReceivableIndex(),
        icon: BarChart3,
        permission: 'invoices.view',
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
