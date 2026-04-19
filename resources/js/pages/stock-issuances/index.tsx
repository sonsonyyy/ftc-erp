import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as stockIssuancesCreate, index as stockIssuancesIndex, show as stockIssuancesShow } from '@/routes/stock-issuances';
import { PaginationLinks } from '@/components/pagination-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, SelectOption, StockIssuanceFilters, StockIssuanceListItem, StockWorkOrderOption } from '@/types';

type Props = {
    stockIssuances: PaginatedData<StockIssuanceListItem>;
    filters: StockIssuanceFilters;
    warehouseOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: StockWorkOrderOption[];
    can: {
        create: boolean;
    };
};

export default function StockIssuancesIndex({
    stockIssuances,
    filters,
    warehouseOptions,
    projectOptions,
    workOrderOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Stock Issuances" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Stock Issuances</h1>
                        <p className="text-sm text-muted-foreground">
                            Track materials released from warehouse stock to projects and work orders.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockIssuancesCreate()}>New issuance</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search issuances by reference, warehouse, project, or work order.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={stockIssuancesIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search issuances" />

                            <select
                                name="warehouse"
                                defaultValue={filters.warehouse ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All warehouses</option>
                                {warehouseOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="project"
                                defaultValue={filters.project ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All projects</option>
                                {projectOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="work_order"
                                defaultValue={filters.work_order ?? ''}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All work orders</option>
                                {workOrderOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={stockIssuancesIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Issuance log</CardTitle>
                        <CardDescription>{stockIssuances.total} issuance records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Issuance</th>
                                    <th className="px-6 py-3 font-medium">Warehouse</th>
                                    <th className="px-6 py-3 font-medium">Project / work order</th>
                                    <th className="px-6 py-3 font-medium">Items</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {stockIssuances.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                                            No issuance records matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {stockIssuances.data.map((issuance) => (
                                    <tr key={issuance.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{issuance.issuance_no}</p>
                                            <p className="text-muted-foreground">{issuance.issued_date ?? 'No date'}</p>
                                            <p className="text-xs text-muted-foreground">{issuance.created_by ?? 'System'}</p>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {issuance.warehouse.warehouse_code} - {issuance.warehouse.warehouse_name}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{issuance.project.project_no ?? 'No project selected'}</p>
                                                <p>{issuance.work_order.work_order_no ?? 'No work order selected'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{issuance.item_count} lines</p>
                                                <p>{issuance.total_quantity.toFixed(2)} total quantity</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {issuance.can.view && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={stockIssuancesShow(issuance.id)}>Open</Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={stockIssuances} />
                </Card>
            </div>
        </>
    );
}

StockIssuancesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Issuances', href: stockIssuancesIndex() },
    ],
};
