import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import {
    create as stockMovementsCreate,
    index as stockMovementsIndex,
} from '@/routes/stock-movements';
import { FilterSelect } from '@/components/filter-select';
import { IndexFiltersCard } from '@/components/index-filters-card';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
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
    StockMovementFilters,
    StockMovementListItem,
} from '@/types';

type Props = {
    movements: PaginatedData<StockMovementListItem>;
    filters: StockMovementFilters;
    warehouseOptions: SelectOption[];
    itemOptions: SelectOption[];
    movementTypeOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

export default function StockMovementsIndex({
    movements,
    filters,
    warehouseOptions,
    itemOptions,
    movementTypeOptions,
    can,
}: Props) {
    const activeFilterCount = countActiveFilters(filters);

    return (
        <>
            <Head title="Stock Movements" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Stock Movements
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review the warehouse movement log and record manual
                            stock in, stock out, and adjustment entries.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={stockMovementsCreate()}>
                                Manual movement
                            </Link>
                        </Button>
                    )}
                </div>

                <IndexFiltersCard
                    action={stockMovementsIndex()}
                    resetHref={stockMovementsIndex()}
                    description="Search by reference, warehouse, item, or movement type."
                    activeFilterCount={activeFilterCount}
                    fieldsClassName="xl:grid-cols-[2fr_1.2fr_1.4fr_1.2fr]"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Search movements"
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

                    <FilterSelect name="item" defaultValue={filters.item ?? ''}>
                        <option value="">All items</option>
                        {itemOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>

                    <FilterSelect name="type" defaultValue={filters.type}>
                        <option value="">All types</option>
                        {movementTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </FilterSelect>
                </IndexFiltersCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Movement log</CardTitle>
                        <CardDescription>
                            {movements.total} movement records
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Movement
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Warehouse
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Balance after
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Recorded
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {movements.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-muted-foreground"
                                        >
                                            No movement records matched the
                                            current filters.
                                        </td>
                                    </tr>
                                )}

                                {movements.data.map((movement) => (
                                    <tr
                                        key={movement.id}
                                        className="border-b align-top last:border-0"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <Badge variant="outline">
                                                    {
                                                        movement.movement_type_label
                                                    }
                                                </Badge>
                                                <p className="text-muted-foreground">
                                                    {movement.reference_number ??
                                                        'No reference number'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {movement.remarks ??
                                                        'No remarks'}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {movement.inventory_item.item_code}{' '}
                                            -{' '}
                                            {movement.inventory_item.item_name}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {movement.warehouse.warehouse_code}{' '}
                                            -{' '}
                                            {movement.warehouse.warehouse_name}
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            {movement.quantity.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {movement.balance_after.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {movement.movement_date ??
                                                'No date'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={movements} />
                </Card>
            </div>
        </>
    );
}

StockMovementsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Stock Movements', href: stockMovementsIndex() },
    ],
};
