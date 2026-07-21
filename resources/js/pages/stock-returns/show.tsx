import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as stockReturnsIndex } from '@/routes/stock-returns';
import type { StockReturnDetail } from '@/types';

type Props = {
    stockReturn: StockReturnDetail;
};

export default function StockReturnsShow({ stockReturn }: Props) {
    return (
        <>
            <Head title={stockReturn.return_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {stockReturn.return_no}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Returned on {stockReturn.returned_date ?? 'No date'} by{' '}
                        {stockReturn.created_by ?? 'System'}
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Return context</CardTitle>
                            <CardDescription>
                                Operational context and receiving record for the
                                returned stock.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Warehouse
                                </p>
                                <p className="mt-1 font-medium">
                                    {stockReturn.warehouse.warehouse_code} -{' '}
                                    {stockReturn.warehouse.warehouse_name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Project
                                </p>
                                <p className="mt-1 font-medium">
                                    {stockReturn.project.project_no ??
                                        'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Work order
                                </p>
                                <p className="mt-1 font-medium">
                                    {stockReturn.work_order.work_order_no ??
                                        'Not linked'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {stockReturn.remarks ??
                                        'No remarks recorded'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Returned items</CardTitle>
                            <CardDescription>
                                Inventory lines received back into warehouse
                                stock through this return record.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {stockReturn.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border px-4 py-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {item.inventory_item.item_code}{' '}
                                                -{' '}
                                                {item.inventory_item.item_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.inventory_item.unit}
                                            </p>
                                        </div>

                                        <p className="font-medium">
                                            {item.quantity.toFixed(2)}
                                        </p>
                                    </div>

                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {item.remarks ?? 'No remarks'}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

StockReturnsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Returns', href: stockReturnsIndex() },
        { title: 'Return details', href: stockReturnsIndex() },
    ],
};
