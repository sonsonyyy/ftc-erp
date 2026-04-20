import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { show as customersShow } from '@/routes/customers';
import { show as invoicesShow } from '@/routes/invoices';
import { create as taxReportRunsCreate, index as taxReportRunsIndex } from '@/routes/tax-report-runs';
import { index as vatRecordsIndex } from '@/routes/vat-records';
import { index as withholdingRecordsIndex } from '@/routes/withholding-records';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type {
    PaginatedData,
    SelectOption,
    TaxSourceFilters,
    VatRecordListItem,
} from '@/types';

type Props = {
    vatRecords: PaginatedData<VatRecordListItem>;
    filters: TaxSourceFilters;
    typeOptions: SelectOption[];
    can: {
        generate_reports: boolean;
    };
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date: string | null): string {
    if (!date) {
        return 'Not set';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function recordBadgeClass(type: string): string {
    return {
        output_vat: 'border-sky-200 bg-sky-50 text-sky-700',
        input_vat: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }[type] ?? 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function VatRecordsIndex({
    vatRecords,
    filters,
    typeOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="VAT Records" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">VAT Records</h1>
                        <p className="text-sm text-muted-foreground">
                            Review invoice-derived VAT source records before generating summary runs.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={withholdingRecordsIndex()}>Withholding records</Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={taxReportRunsIndex()}>Report runs</Link>
                        </Button>

                        {can.generate_reports && (
                            <Button asChild>
                                <Link href={taxReportRunsCreate()}>New report run</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by invoice or counterparty, then narrow by VAT record type and invoice date window.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={vatRecordsIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search VAT records"
                            />

                            <select
                                name="type"
                                defaultValue={filters.type}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All types</option>
                                {typeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Input name="from" type="date" defaultValue={filters.from ?? ''} />
                            <Input name="to" type="date" defaultValue={filters.to ?? ''} />

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={vatRecordsIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Source record list</CardTitle>
                        <CardDescription>{vatRecords.total} VAT source records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Date / type</th>
                                    <th className="px-6 py-3 font-medium">Reference</th>
                                    <th className="px-6 py-3 font-medium">Counterparty</th>
                                    <th className="px-6 py-3 font-medium">Amounts</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {vatRecords.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                                            No VAT records matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {vatRecords.data.map((record) => (
                                    <tr key={record.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <p className="font-medium">{formatDate(record.record_date)}</p>
                                                <Badge variant="outline" className={recordBadgeClass(record.record_type)}>
                                                    {record.record_type_label}
                                                </Badge>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{record.reference_no ?? 'No reference'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {record.source.invoice_no ?? 'No invoice no.'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{record.counterparty_name}</p>
                                                <p>{record.counterparty_tin ?? 'No TIN'}</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">Net {formatCurrency(record.net_amount)}</p>
                                                <p className="text-muted-foreground">
                                                    VAT {formatCurrency(record.vat_amount)}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Gross {formatCurrency(record.gross_amount)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {record.source.customer_id && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={customersShow(record.source.customer_id)}>
                                                            Customer
                                                        </Link>
                                                    </Button>
                                                )}

                                                {record.source.invoice_id && (
                                                    <Button size="sm" asChild>
                                                        <Link href={invoicesShow(record.source.invoice_id)}>
                                                            Invoice
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={vatRecords} />
                </Card>
            </div>
        </>
    );
}

VatRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'VAT Records', href: vatRecordsIndex() },
    ],
};
