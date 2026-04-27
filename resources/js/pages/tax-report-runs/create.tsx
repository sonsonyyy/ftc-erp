import { Head, Link, useForm } from '@inertiajs/react';
import TaxReportRunController from '@/actions/App/Http/Controllers/Tax/TaxReportRunController';
import { dashboard } from '@/routes';
import {
    create as taxReportRunsCreate,
    index as taxReportRunsIndex,
} from '@/routes/tax-report-runs';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SelectOption, TaxReportRunFormDefaults } from '@/types';

type Props = {
    reportTypeOptions: SelectOption[];
    defaults: TaxReportRunFormDefaults;
};

export default function TaxReportRunsCreate({
    reportTypeOptions,
    defaults,
}: Props) {
    const form = useForm({
        report_type: defaults.report_type,
        period_from: defaults.period_from,
        period_to: defaults.period_to,
        remarks: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            report_type: data.report_type,
            period_from: data.period_from,
            period_to: data.period_to,
            remarks: data.remarks || null,
        }));

        form.submit(TaxReportRunController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="New Tax Report Run" />

            <div className="app-page flex flex-1 flex-col gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        New tax report run
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Generate a reviewable statutory snapshot from the
                        currently synced source records.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="grid gap-6 lg:grid-cols-[2fr_1fr]"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Run details</CardTitle>
                            <CardDescription>
                                Choose the report type and covered period. The
                                system will derive items from the current
                                payroll and billing sources.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="report_type">Report type</Label>
                                <select
                                    id="report_type"
                                    value={form.data.report_type}
                                    onChange={(event) =>
                                        form.setData(
                                            'report_type',
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    {reportTypeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={form.errors.report_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="period_from">Period from</Label>
                                <Input
                                    id="period_from"
                                    type="date"
                                    value={form.data.period_from}
                                    onChange={(event) =>
                                        form.setData(
                                            'period_from',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.period_from} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="period_to">Period to</Label>
                                <Input
                                    id="period_to"
                                    type="date"
                                    value={form.data.period_to}
                                    onChange={(event) =>
                                        form.setData(
                                            'period_to',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.period_to} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    rows={4}
                                    value={form.data.remarks}
                                    onChange={(event) =>
                                        form.setData(
                                            'remarks',
                                            event.currentTarget.value,
                                        )
                                    }
                                    placeholder="Optional notes on why this run was generated."
                                />
                                <InputError message={form.errors.remarks} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                The generated run is a saved snapshot, so you
                                can review it later even if source transactions
                                change.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                Generate report run
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href={taxReportRunsIndex()}>Cancel</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

TaxReportRunsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tax Report Runs', href: taxReportRunsIndex() },
        { title: 'New tax report run', href: taxReportRunsCreate() },
    ],
};
