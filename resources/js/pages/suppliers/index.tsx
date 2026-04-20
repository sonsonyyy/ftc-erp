import { Form, Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { create as suppliersCreate, edit as suppliersEdit, index as suppliersIndex, show as suppliersShow } from '@/routes/suppliers';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PaginatedData, SelectOption, SupplierListItem } from '@/types';

type Props = {
    suppliers: PaginatedData<SupplierListItem>;
    filters: {
        search: string;
        activity: string;
    };
    activityOptions: SelectOption[];
    can: {
        create: boolean;
    };
};

function badgeClass(isActive: boolean): string {
    return isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function SuppliersIndex({ suppliers, filters, activityOptions, can }: Props) {
    return (
        <>
            <Head title="Suppliers" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
                        <p className="text-sm text-muted-foreground">
                            Maintain the supplier registry used by procurement, ordering, and receiving.
                        </p>
                    </div>

                    {can.create && (
                        <Button asChild>
                            <Link href={suppliersCreate()}>New supplier</Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Search by supplier code, company, contact person, phone, email, or payment terms.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={suppliersIndex()}
                            method="get"
                            options={{ preserveState: true, replace: true }}
                            className="grid gap-3 md:grid-cols-[2fr_1fr_auto_auto]"
                        >
                            <Input
                                name="search"
                                defaultValue={filters.search}
                                placeholder="Search suppliers"
                            />

                            <select
                                name="activity"
                                defaultValue={filters.activity}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
                            >
                                <option value="">All suppliers</option>
                                {activityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <Button type="submit">Apply</Button>

                            <Button variant="outline" asChild>
                                <Link href={suppliersIndex()}>Reset</Link>
                            </Button>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Supplier list</CardTitle>
                        <CardDescription>{suppliers.total} supplier records</CardDescription>
                    </CardHeader>

                    <CardContent className="overflow-x-auto px-0">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">Supplier</th>
                                    <th className="px-6 py-3 font-medium">Contact</th>
                                    <th className="px-6 py-3 font-medium">Activity</th>
                                    <th className="px-6 py-3 font-medium">Linked docs</th>
                                    <th className="px-6 py-3 font-medium">Attachments</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {suppliers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                            No suppliers matched the current filters.
                                        </td>
                                    </tr>
                                )}

                                {suppliers.data.map((supplier) => (
                                    <tr key={supplier.id} className="border-b align-top last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-medium">{supplier.company_name}</p>
                                                <p className="text-muted-foreground">{supplier.supplier_code}</p>
                                                {supplier.payment_terms && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Terms: {supplier.payment_terms}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{supplier.contact_person ?? 'No contact person'}</p>
                                                {supplier.phone && <p>{supplier.phone}</p>}
                                                {supplier.email && <p>{supplier.email}</p>}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={badgeClass(supplier.is_active)}>
                                                {supplier.activity_label}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">
                                            <div className="space-y-1">
                                                <p>{supplier.purchase_request_count} requests</p>
                                                <p>{supplier.purchase_order_count} orders</p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">{supplier.attachment_count}</td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {supplier.can.view && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={suppliersShow(supplier.id)}>Open</Link>
                                                    </Button>
                                                )}

                                                {supplier.can.update && (
                                                    <Button size="sm" asChild>
                                                        <Link href={suppliersEdit(supplier.id)}>Edit</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>

                    <PaginationLinks pagination={suppliers} />
                </Card>
            </div>
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Suppliers', href: suppliersIndex() },
    ],
};
