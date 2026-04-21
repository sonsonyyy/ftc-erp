import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    CreditCard,
    FolderKanban,
    LayoutGrid,
    Package,
    Settings,
    ShieldCheck,
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
import { index as accountsReceivableIndex } from '@/routes/accounts-receivable';
import { index as complianceAlertsIndex } from '@/routes/compliance-alerts';
import { index as complianceRecordsIndex } from '@/routes/compliance-records';
import { calendar as complianceCalendar } from '@/routes/compliance-records';
import { index as customersIndex } from '@/routes/customers';
import { index as departmentsIndex } from '@/routes/departments';
import { index as employeesIndex } from '@/routes/employees';
import { index as inventoryIndex } from '@/routes/inventory';
import { lowStock as inventoryLowStock } from '@/routes/inventory';
import { index as inventoryCategoriesIndex } from '@/routes/inventory-categories';
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
import { index as vatRecordsIndex } from '@/routes/vat-records';
import { index as warehousesIndex } from '@/routes/warehouses';
import { index as withholdingRecordsIndex } from '@/routes/withholding-records';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { kpi as quotationsKpi } from '@/routes/quotations';
import type { Auth, NavItem, NavSection } from '@/types';

const primaryNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
];

const navSections: NavSection[] = [
    {
        title: 'Customers & Sites',
        icon: Building2,
        items: [
            {
                title: 'Customers',
                href: customersIndex(),
                permission: 'customers.view',
            },
            {
                title: 'Sites',
                href: sitesIndex(),
                permission: 'sites.view',
            },
        ],
    },
    {
        title: 'Sales',
        icon: BarChart3,
        items: [
            {
                title: 'Quotations',
                href: quotationsIndex(),
                permission: 'quotations.view',
            },
            {
                title: 'Sales KPI',
                href: quotationsKpi(),
                permission: 'quotations.view',
            },
        ],
    },
    {
        title: 'Projects & Service',
        icon: FolderKanban,
        items: [
            {
                title: 'Projects',
                href: projectsIndex(),
                permission: 'projects.view',
            },
            {
                title: 'Work Orders',
                href: workOrdersIndex(),
                permission: 'work_orders.view',
            },
        ],
    },
    {
        title: 'Inventory & Purchasing',
        icon: Package,
        items: [
            {
                title: 'Inventory Items',
                href: inventoryIndex(),
                permission: 'inventory.view',
            },
            {
                title: 'Categories',
                href: inventoryCategoriesIndex(),
                permission: 'inventory.view',
            },
            {
                title: 'Warehouses',
                href: warehousesIndex(),
                permission: 'warehouses.view',
            },
            {
                title: 'Low Stock',
                href: inventoryLowStock(),
                permission: 'inventory.view',
            },
            {
                title: 'Stock Movements',
                href: stockMovementsIndex(),
                permission: 'stock.view',
            },
            {
                title: 'Stock Issuances',
                href: stockIssuancesIndex(),
                permission: 'stock.view',
            },
            {
                title: 'Stock Returns',
                href: stockReturnsIndex(),
                permission: 'stock.view',
            },
            {
                title: 'Suppliers',
                href: suppliersIndex(),
                permission: 'suppliers.view',
            },
            {
                title: 'Purchase Requests',
                href: purchaseRequestsIndex(),
                permission: 'purchase_requests.view',
            },
            {
                title: 'Purchase Orders',
                href: purchaseOrdersIndex(),
                permission: 'purchase_orders.view',
            },
            {
                title: 'Purchase Receipts',
                href: purchaseReceiptsIndex(),
                permission: 'purchase_receipts.view',
            },
        ],
    },
    {
        title: 'Billing & Receivables',
        icon: CreditCard,
        items: [
            {
                title: 'Invoices',
                href: invoicesIndex(),
                permission: 'invoices.view',
            },
            {
                title: 'Payments',
                href: paymentsIndex(),
                permission: 'payments.view',
            },
            {
                title: 'AR Aging',
                href: accountsReceivableIndex(),
                permission: 'invoices.view',
            },
        ],
    },
    {
        title: 'People & Payroll',
        icon: Users,
        items: [
            {
                title: 'Employees',
                href: employeesIndex(),
                permission: 'employees.view',
            },
            {
                title: 'Payroll Runs',
                href: payrollRunsIndex(),
                permission: 'payroll_runs.view',
            },
            {
                title: 'Departments',
                href: departmentsIndex(),
                permission: 'departments.view',
            },
            {
                title: 'Positions',
                href: positionsIndex(),
                permission: 'positions.view',
            },
        ],
    },
    {
        title: 'Compliance & Tax',
        icon: ShieldCheck,
        items: [
            {
                title: 'Compliance Records',
                href: complianceRecordsIndex(),
                permission: 'compliance_records.view',
            },
            {
                title: 'Compliance Alerts',
                href: complianceAlertsIndex(),
                permission: 'compliance_alerts.view',
            },
            {
                title: 'Compliance Calendar',
                href: complianceCalendar(),
                permission: 'compliance_records.view',
            },
            {
                title: 'Tax Reports',
                href: taxReportRunsIndex(),
                permission: 'tax_report_runs.view',
            },
            {
                title: 'VAT Records',
                href: vatRecordsIndex(),
                permission: 'vat_records.view',
            },
            {
                title: 'Withholding Records',
                href: withholdingRecordsIndex(),
                permission: 'withholding_records.view',
            },
        ],
    },
    {
        title: 'Administration',
        icon: Settings,
        items: [
            {
                title: 'Users',
                href: usersIndex(),
                permission: 'users.view',
            },
        ],
    },
];

function filterVisibleNavItems(
    items: NavItem[],
    permissions: string[],
): NavItem[] {
    return items.filter(
        (item) =>
            item.permission === undefined ||
            permissions.includes(item.permission),
    );
}

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };
    const visiblePrimaryNavItems = filterVisibleNavItems(
        primaryNavItems,
        auth.permissions,
    );
    const visibleNavSections = navSections
        .map((section) => ({
            ...section,
            items: filterVisibleNavItems(section.items, auth.permissions),
        }))
        .filter((section) => section.items.length > 0);

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
                <NavMain
                    primaryItems={visiblePrimaryNavItems}
                    sections={visibleNavSections}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
