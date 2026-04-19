import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as stockReturnsCreate, index as stockReturnsIndex, show as stockReturnsShow } from '@/routes/stock-returns';
import { PaginationLinks } from '@/components/pagination-links';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, SelectOption, StockReturnFilters, StockReturnListItem, StockWorkOrderOption } from '@/types';

type Props = {
    stockReturns: PaginatedData<StockReturnListItem>;
    filters: StockReturnFilters;
    warehouseOptions: SelectOption[];
    projectOptions: SelectOption[];
    workOrderOptions: StockWorkOrderOption[];
    can: {
        create: boolean;
    };
};

export default function StockReturnsIndex({
    stockReturns,
    filters,
    warehouseOptions,
    projectOptions,
    workOrderOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Stock Returns" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Stock Returns</h1>
                        <p className="text-sm text-muted-foreground">
                            Track materials returned to warehouse stock from project and work order activity.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockReturnsCreate()}>New return</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search returns by reference, warehouse, project, or work order.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={stockReturnsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_auto_auto]"
                        >
                            <Input name="search" defaultValue={filters.search} placeholder="Search returns" />

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
                                <Link href={stockReturnsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Return log</CardTitle>
                        <CardDescription>{stockReturns.total} return records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Return</th>
                                    <th className="px-6 py-3 font-medium">Warehouse</th>
                                    <th className="px-6 py-3 font-medium">Project / work order</th>
                                    <th className="px-6 py-3 font-medium">Items</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {stockReturns.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                                            No return records matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {stockReturns.data.map((stockReturn) => (
                                    <tr key={stockReturn.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{stockReturn.return_no}</p>
                                            <p className="text-muted-foreground">{stockReturn.returned_date ?? 'No date'}</p>
                                            <p className="text-xs text-muted-foreground">{stockReturn.created_by ?? 'System'}</p>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {stockReturn.warehouse.warehouse_code} - {stockReturn.warehouse.warehouse_name}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{stockReturn.project.project_no ?? 'No project selected'}</p>
                                                <p>{stockReturn.work_order.work_order_no ?? 'No work order selected'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{stockReturn.item_count} lines</p>
                                                <p>{stockReturn.total_quantity.toFixed(2)} total quantity</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {stockReturn.can.view && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={stockReturnsShow(stockReturn.id)}>Open</Link>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={stockReturns} />
                </Card>
            </div>
        </>
    );
}

StockReturnsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Returns', href: stockReturnsIndex() },
    ],
};
