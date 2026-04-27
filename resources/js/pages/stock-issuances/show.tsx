import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as stockIssuancesIndex } from '@/routes/stock-issuances';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { StockIssuanceDetail } from '@/types';

type Props = {
    stockIssuance: StockIssuanceDetail;
};

export default function StockIssuancesShow({ stockIssuance }: Props) {
    return (
        <>
            <Head title={stockIssuance.issuance_no} />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {stockIssuance.issuance_no}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Issued on {stockIssuance.issued_date ?? 'No date'} by{' '}
                        {stockIssuance.created_by ?? 'System'}
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Issuance context</CardTitle>
                            <CardDescription>
                                Operational context and receiving record for the
                                issued stock.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Warehouse
                                </p>
                                <p className="mt-1 font-medium">
                                    {stockIssuance.warehouse.warehouse_code} -{' '}
                                    {stockIssuance.warehouse.warehouse_name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Project
                                </p>
                                <p className="mt-1 font-medium">
                                    {stockIssuance.project.project_no ??
                                        'Not linked'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Work order
                                </p>
                                <p className="mt-1 font-medium">
                                    {stockIssuance.work_order.work_order_no ??
                                        'Not linked'}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">
                                    Remarks
                                </p>
                                <p className="mt-1 font-medium whitespace-pre-line">
                                    {stockIssuance.remarks ??
                                        'No remarks recorded'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Issued items</CardTitle>
                            <CardDescription>
                                Inventory lines released from warehouse stock in
                                this issuance.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {stockIssuance.items.map((item) => (
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

StockIssuancesShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Issuances', href: stockIssuancesIndex() },
        { title: 'Issuance details', href: stockIssuancesIndex() },
    ],
};
