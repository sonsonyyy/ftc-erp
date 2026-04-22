import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { show as employeesShow } from '@/routes/employees';
import { show as payrollRunsShow } from '@/routes/payroll-runs';
import {
    create as taxReportRunsCreate,
    index as taxReportRunsIndex,
} from '@/routes/tax-report-runs';
import { index as vatRecordsIndex } from '@/routes/vat-records';
import { index as withholdingRecordsIndex } from '@/routes/withholding-records';
import { DataTableCard } from '@/components/data-table-card';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    PaginatedData,
    SelectOption,
    TaxSourceFilters,
    WithholdingRecordListItem,
} from '@/types';

type Props = {
    withholdingRecords: PaginatedData<WithholdingRecordListItem>;
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
    return (
        {
            compensation_withholding: 'border-sky-200 bg-sky-50 text-sky-700',
            expanded_withholding:
                'border-indigo-200 bg-indigo-50 text-indigo-700',
            sss_contribution:
                'border-emerald-200 bg-emerald-50 text-emerald-700',
            pagibig_contribution: 'border-amber-200 bg-amber-50 text-amber-700',
            philhealth_contribution: 'border-rose-200 bg-rose-50 text-rose-700',
        }[type] ?? 'border-slate-200 bg-slate-100 text-slate-700'
    );
}

export default function WithholdingRecordsIndex({
    withholdingRecords,
    filters,
    typeOptions,
    can,
}: Props) {
    return (
        <>
            <Head title="Withholding Records" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Withholding Records
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review compensation withholding and payroll-linked
                            contribution source records before generating
                            statutory reports.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={vatRecordsIndex()}>VAT records</Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={taxReportRunsIndex()}>Report runs</Link>
                        </Button>

                        {can.generate_reports && (
                            <Button asChild>
                                <Link href={taxReportRunsCreate()}>
                                    New report run
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <IndexFiltersCard
                    action={withholdingRecordsIndex()}
                    resetHref={withholdingRecordsIndex()}
                    filters={filters}
                    description="Search by payroll reference, employee, or TIN, then narrow by record type and covered dates."
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search records"
                    />

                    <FilterSelect name="type" defaultValue={filters.type}>
                        <option value="">All types</option>
                        {typeOptions.map((option) => (
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
                    title="Source record list"
                    description={`${withholdingRecords.total} withholding or contribution records`}
                    pagination={withholdingRecords}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Date / type
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Subject
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Reference
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Amounts
                                </th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {withholdingRecords.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No withholding records matched the
                                        current filters.
                                    </td>
                                </tr>
                            )}

                            {withholdingRecords.data.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {formatDate(record.record_date)}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={recordBadgeClass(
                                                    record.record_type,
                                                )}
                                            >
                                                {record.record_type_label}
                                            </Badge>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                {record.subject_name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {record.subject_identifier ??
                                                    'No employee no.'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {record.subject_tin ?? 'No TIN'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {record.reference_no ??
                                                    'No reference'}
                                            </p>
                                            <p className="text-xs">
                                                Source:{' '}
                                                {record.source.type.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">
                                                Base{' '}
                                                {formatCurrency(
                                                    record.base_amount,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Amount{' '}
                                                {formatCurrency(record.amount)}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {record.source.employee_id && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={employeesShow(
                                                            record.source
                                                                .employee_id,
                                                        )}
                                                    >
                                                        Employee
                                                    </Link>
                                                </Button>
                                            )}

                                            {record.source.payroll_run_id && (
                                                <Button size="sm" asChild>
                                                    <Link
                                                        href={payrollRunsShow(
                                                            record.source
                                                                .payroll_run_id,
                                                        )}
                                                    >
                                                        Payroll run
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

WithholdingRecordsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Withholding Records', href: withholdingRecordsIndex() },
    ],
};
