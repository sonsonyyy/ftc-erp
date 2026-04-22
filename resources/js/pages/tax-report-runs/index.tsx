import { Head, Link } from '@inertiajs/react';
import TaxReportRunController from '@/actions/App/Http/Controllers/Tax/TaxReportRunController';
import { dashboard } from '@/routes';
import {
    create as taxReportRunsCreate,
    index as taxReportRunsIndex,
    show as taxReportRunsShow,
} from '@/routes/tax-report-runs';
import { index as vatRecordsIndex } from '@/routes/vat-records';
import { index as withholdingRecordsIndex } from '@/routes/withholding-records';
import { DataTableCard } from '@/components/data-table-card';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    PaginatedData,
    SelectOption,
    TaxReportRunFilters,
    TaxReportRunListItem,
} from '@/types';

type Props = {
    taxReportRuns: PaginatedData<TaxReportRunListItem>;
    filters: TaxReportRunFilters;
    reportTypeOptions: SelectOption[];
    can: {
        create: boolean;
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

function formatDateTime(date: string | null): string {
    if (!date) {
        return 'Not generated';
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

export default function TaxReportRunsIndex({
    taxReportRuns,
    filters,
    reportTypeOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Tax Report Runs" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Tax Report Runs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Generate reviewable statutory snapshots from current
                            withholding and VAT source records.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={withholdingRecordsIndex()}>
                                Withholding records
                            </Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={vatRecordsIndex()}>VAT records</Link>
                        </Button>

                        {can.create && (
                            <Button asChild>
                                <Link href={taxReportRunsCreate()}>
                                    New report run
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <IndexFiltersCard
                    action={taxReportRunsIndex()}
                    resetHref={taxReportRunsIndex()}
                    filters={filters}
                    description="Search by report number or remarks, then narrow by report type and covered period."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search report runs"
                    />

                    <FilterSelect name="type" defaultValue={filters.type}>
                        <option value="">All report types</option>
                        {reportTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <Input
                        name="from"
                        type="date"
                        defaultValue={filters.from ?? ''}
                    />
                    <Input
                        name="to"
                        type="date"
                        defaultValue={filters.to ?? ''}
                    />
                </IndexFiltersCard>

                <DataTableCard
                    title="Generated runs"
                    description={`${taxReportRuns.total} saved report snapshots`}
                    pagination={taxReportRuns}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Report
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Covered period
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Totals
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Generated
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {taxReportRuns.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No tax report runs matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {taxReportRuns.data.map((taxReportRun) => (
                                <tr
                                    key={taxReportRun.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {taxReportRun.report_no}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {taxReportRun.report_type_label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {taxReportRun.item_count} items
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                From:{' '}
                                                {formatDate(
                                                    taxReportRun.period_from,
                                                )}
                                            </p>
                                            <p>
                                                To:{' '}
                                                {formatDate(
                                                    taxReportRun.period_to,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                Base{' '}
                                                {formatCurrency(
                                                    taxReportRun.base_amount_total,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Amount{' '}
                                                {formatCurrency(
                                                    taxReportRun.amount_total,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                VAT{' '}
                                                {formatCurrency(
                                                    taxReportRun.vat_amount_total,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Gross{' '}
                                                {formatCurrency(
                                                    taxReportRun.gross_amount_total,
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {formatDateTime(
                                                    taxReportRun.generated_at,
                                                )}
                                            </p>
                                            <p>
                                                {taxReportRun.generated_by ??
                                                    'Unknown user'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {taxReportRun.can.view && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={taxReportRunsShow(
                                                            taxReportRun.id,
                                                        )}
                                                    >
                                                        Open
                                                    </Link>
                                                </Button>
                                            )}

                                            {taxReportRun.can.delete && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={TaxReportRunController.destroy(
                                                            taxReportRun.id,
                                                        )}
                                                        method="delete"
                                                        as="button"
                                                    >
                                                        Archive
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableCard>
            </div>
        </>
    );
}

TaxReportRunsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tax Report Runs', href: taxReportRunsIndex() },
    ],
};
