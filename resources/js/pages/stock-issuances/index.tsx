import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as stockIssuancesCreate,
    index as stockIssuancesIndex,
    show as stockIssuancesShow,
} from '@/routes/stock-issuances';
import { FilterSelect } from '@/components/filter-select';
import { DataTableCard } from '@/components/data-table-card';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { countActiveFilters } from '@/lib/utils';
import type {
    PaginatedData,
    SelectOption,
    StockIssuanceFilters,
    StockIssuanceListItem,
    StockWorkOrderOption,
} from '@/types';

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
    const activeFilterCount = countActiveFilters(filters);

    return (
        <>
            <Head title="Stock Issuances" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Stock Issuances
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track materials released from warehouse stock to
                            projects and work orders.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockIssuancesCreate()}>
                                New issuance
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={stockIssuancesIndex()}
                    resetHref={stockIssuancesIndex()}
                    filters={filters}
                    description="Search issuances by reference, warehouse, project, or work order."
                    activeFilterCount={activeFilterCount}
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search issuances"
                    />

                    <FilterSelect
                        name="warehouse"
                        defaultValue={filters.warehouse ?? ''}
                    >
                        <option value="">All warehouses</option>
                        {warehouseOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="project"
                        defaultValue={filters.project ?? ''}
                    >
                        <option value="">All projects</option>
                        {projectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect
                        name="work_order"
                        defaultValue={filters.work_order ?? ''}
                    >
                        <option value="">All work orders</option>
                        {workOrderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <DataTableCard
                    title="Issuance log"
                    description={`${stockIssuances.total} issuance records`}
                    pagination={stockIssuances}
                >
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="px-6 py-3 font-medium">
                                    Issuance
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Warehouse
                                </th>
                                <th className="px-6 py-3 font-medium">
                                    Project / work order
                                </th>
                                <th className="px-6 py-3 font-medium">Items</th>
                                <th className="px-6 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {stockIssuances.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-muted-foreground"
                                    >
                                        No issuance records matched the current
                                        filters.
                                    </td>
                                </tr>
                            )}

                            {stockIssuances.data.map((issuance) => (
                                <tr
                                    key={issuance.id}
                                    className="border-b align-top last:border-0"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium">
                                            {issuance.issuance_no}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {issuance.issued_date ?? 'No date'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {issuance.created_by ?? 'System'}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        {issuance.warehouse.warehouse_code} -{' '}
                                        {issuance.warehouse.warehouse_name}
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>
                                                {issuance.project.project_no ??
                                                    'No project selected'}
                                            </p>
                                            <p>
                                                {issuance.work_order
                                                    .work_order_no ??
                                                    'No work order selected'}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="space-y-1">
                                            <p>{issuance.item_count} lines</p>
                                            <p>
                                                {issuance.total_quantity.toFixed(
                                                    2,
                                                )}{' '}
                                                total quantity
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        {issuance.can.view && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={stockIssuancesShow(
                                                        issuance.id,
                                                    )}
                                                >
                                                    Open
                                                </Link>
                                            </Button>
                                        )}
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

StockIssuancesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Issuances', href: stockIssuancesIndex() },
    ],
};
