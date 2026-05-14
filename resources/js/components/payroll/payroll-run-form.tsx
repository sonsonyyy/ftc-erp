import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import PayrollRunController from '@/actions/App/Http/Controllers/Payroll/PayrollRunController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    PayrollEmployeeOption,
    PayrollRunDetail,
    PayrollRunFormDefaults,
    SelectOption,
} from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type DeductionInput = {
    deduction_name: string;
    amount: string;
    remarks: string;
};

type EntryInput = {
    employee_id: string;
    gross_pay: string;
    tax_amount: string;
    sss_amount: string;
    pagibig_amount: string;
    philhealth_amount: string;
    remarks: string;
    deductions: DeductionInput[];
};

type Props = {
    payrollRun?: PayrollRunDetail;
    employeeOptions: PayrollEmployeeOption[];
    statusOptions: SelectOption[];
    defaults?: PayrollRunFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

function blankDeduction(): DeductionInput {
    return {
        deduction_name: '',
        amount: '',
        remarks: '',
    };
}

function blankEntry(): EntryInput {
    return {
        employee_id: '',
        gross_pay: '',
        tax_amount: '0',
        sss_amount: '0',
        pagibig_amount: '0',
        philhealth_amount: '0',
        remarks: '',
        deductions: [],
    };
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(amount);
}

export function PayrollRunForm({
    payrollRun,
    employeeOptions,
    statusOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        payroll_run_no:
            payrollRun?.payroll_run_no ?? defaults?.payroll_run_no ?? '',
        period_from: payrollRun?.period_from ?? defaults?.period_from ?? '',
        period_to: payrollRun?.period_to ?? defaults?.period_to ?? '',
        payroll_date: payrollRun?.payroll_date ?? defaults?.payroll_date ?? '',
        status: payrollRun?.status ?? defaults?.status ?? 'draft',
        remarks: payrollRun?.remarks ?? '',
        entries: payrollRun?.entries.map((entry) => ({
            employee_id: String(entry.employee_id),
            gross_pay: String(entry.gross_pay),
            tax_amount: String(entry.tax_amount),
            sss_amount: String(entry.sss_amount),
            pagibig_amount: String(entry.pagibig_amount),
            philhealth_amount: String(entry.philhealth_amount),
            remarks: entry.remarks ?? '',
            deductions: entry.deductions.map((deduction) => ({
                deduction_name: deduction.deduction_name,
                amount: String(deduction.amount),
                remarks: deduction.remarks ?? '',
            })),
        })) ?? [blankEntry()],
    });

    function fieldError(path: string): string | undefined {
        return form.errors[path as keyof typeof form.errors] as
            | string
            | undefined;
    }

    function entryAdditionalDeductions(entry: EntryInput): number {
        return entry.deductions.reduce(
            (sum, deduction) => sum + Number(deduction.amount || 0),
            0,
        );
    }

    function entryTotalDeductions(entry: EntryInput): number {
        return (
            Number(entry.tax_amount || 0) +
            Number(entry.sss_amount || 0) +
            Number(entry.pagibig_amount || 0) +
            Number(entry.philhealth_amount || 0) +
            entryAdditionalDeductions(entry)
        );
    }

    function entryNetPay(entry: EntryInput): number {
        return Number(entry.gross_pay || 0) - entryTotalDeductions(entry);
    }

    const grossTotal = form.data.entries.reduce(
        (sum, entry) => sum + Number(entry.gross_pay || 0),
        0,
    );
    const deductionsTotal = form.data.entries.reduce(
        (sum, entry) => sum + entryTotalDeductions(entry),
        0,
    );
    const netTotal = form.data.entries.reduce(
        (sum, entry) => sum + entryNetPay(entry),
        0,
    );

    function updateEntry(index: number, key: keyof EntryInput, value: string) {
        form.setData(
            'entries',
            form.data.entries.map((entry, entryIndex) => {
                if (entryIndex !== index) {
                    return entry;
                }

                return {
                    ...entry,
                    [key]: value,
                };
            }),
        );
    }

    function handleEmployeeChange(index: number, value: string) {
        form.setData(
            'entries',
            form.data.entries.map((entry, entryIndex) => {
                if (entryIndex !== index) {
                    return entry;
                }

                const selectedEmployee = employeeOptions.find(
                    (option) => String(option.value) === value,
                );

                return {
                    ...entry,
                    employee_id: value,
                    gross_pay:
                        entry.gross_pay === '' &&
                        selectedEmployee?.basic_salary !== null &&
                        selectedEmployee?.basic_salary !== undefined
                            ? String(selectedEmployee.basic_salary)
                            : entry.gross_pay,
                };
            }),
        );
    }

    function addEntry() {
        form.setData('entries', [...form.data.entries, blankEntry()]);
    }

    function removeEntry(index: number) {
        form.setData(
            'entries',
            form.data.entries.filter((_, entryIndex) => entryIndex !== index),
        );
    }

    function updateDeduction(
        entryIndex: number,
        deductionIndex: number,
        key: keyof DeductionInput,
        value: string,
    ) {
        form.setData(
            'entries',
            form.data.entries.map((entry, currentEntryIndex) => {
                if (currentEntryIndex !== entryIndex) {
                    return entry;
                }

                return {
                    ...entry,
                    deductions: entry.deductions.map(
                        (deduction, currentDeductionIndex) => {
                            if (currentDeductionIndex !== deductionIndex) {
                                return deduction;
                            }

                            return {
                                ...deduction,
                                [key]: value,
                            };
                        },
                    ),
                };
            }),
        );
    }

    function addDeduction(entryIndex: number) {
        form.setData(
            'entries',
            form.data.entries.map((entry, currentEntryIndex) => {
                if (currentEntryIndex !== entryIndex) {
                    return entry;
                }

                return {
                    ...entry,
                    deductions: [...entry.deductions, blankDeduction()],
                };
            }),
        );
    }

    function removeDeduction(entryIndex: number, deductionIndex: number) {
        form.setData(
            'entries',
            form.data.entries.map((entry, currentEntryIndex) => {
                if (currentEntryIndex !== entryIndex) {
                    return entry;
                }

                return {
                    ...entry,
                    deductions: entry.deductions.filter(
                        (_, currentDeductionIndex) =>
                            currentDeductionIndex !== deductionIndex,
                    ),
                };
            }),
        );
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            payroll_run_no: data.payroll_run_no,
            period_from: data.period_from,
            period_to: data.period_to,
            payroll_date: data.payroll_date,
            status: data.status,
            remarks: data.remarks || null,
            entries: data.entries.map((entry) => ({
                employee_id: Number(entry.employee_id),
                gross_pay: Number(entry.gross_pay),
                tax_amount: Number(entry.tax_amount),
                sss_amount: Number(entry.sss_amount),
                pagibig_amount: Number(entry.pagibig_amount),
                philhealth_amount: Number(entry.philhealth_amount),
                remarks: entry.remarks || null,
                deductions: entry.deductions.map((deduction) => ({
                    deduction_name: deduction.deduction_name,
                    amount: Number(deduction.amount),
                    remarks: deduction.remarks || null,
                })),
            })),
        }));

        if (payrollRun) {
            form.submit(PayrollRunController.update(payrollRun.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(PayrollRunController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Gross total</CardDescription>
                        <CardTitle>{formatCurrency(grossTotal)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Total deductions</CardDescription>
                        <CardTitle>{formatCurrency(deductionsTotal)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Net total</CardDescription>
                        <CardTitle>{formatCurrency(netTotal)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Run header</CardTitle>
                        <CardDescription>
                            Define the covered period, payout date, and current
                            payroll run status before encoding employee lines.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="payroll_run_no">
                                Payroll run no.
                            </Label>
                            <Input
                                id="payroll_run_no"
                                value={form.data.payroll_run_no}
                                onChange={(event) =>
                                    form.setData(
                                        'payroll_run_no',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.payroll_run_no} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <SelectInput
                                id="status"
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData(
                                        'status',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={form.errors.status} />
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

                        <div className="grid gap-2">
                            <Label htmlFor="payroll_date">Payroll date</Label>
                            <Input
                                id="payroll_date"
                                type="date"
                                value={form.data.payroll_date}
                                onChange={(event) =>
                                    form.setData(
                                        'payroll_date',
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.payroll_date} />
                        </div>

                        <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                rows={3}
                                value={form.data.remarks}
                                onChange={(event) =>
                                    form.setData(
                                        'remarks',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Optional context for payroll review, release, or follow-up."
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Payroll entries</CardTitle>
                            <CardDescription>
                                Encode employee pay lines, statutory deductions,
                                and any additional payroll adjustments.
                            </CardDescription>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addEntry}
                        >
                            Add employee
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {form.data.entries.map((entry, entryIndex) => {
                            const selectedEmployee = employeeOptions.find(
                                (option) =>
                                    String(option.value) === entry.employee_id,
                            );

                            return (
                                <div
                                    key={`${entryIndex}-${entry.employee_id || 'new'}`}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-medium">
                                                Employee line #{entryIndex + 1}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEmployee
                                                    ? `${selectedEmployee.department_name ?? 'No department'} • ${selectedEmployee.position_title ?? 'No position'}`
                                                    : 'Select an employee to start the payroll line.'}
                                            </p>
                                        </div>

                                        {form.data.entries.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    removeEntry(entryIndex)
                                                }
                                            >
                                                Remove line
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                                            <Label
                                                htmlFor={`employee-${entryIndex}`}
                                            >
                                                Employee
                                            </Label>
                                            <SelectInput
                                                id={`employee-${entryIndex}`}
                                                value={entry.employee_id}
                                                onChange={(event) =>
                                                    handleEmployeeChange(
                                                        entryIndex,
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                <option value="">
                                                    Select employee
                                                </option>
                                                {employeeOptions.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </SelectInput>
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.employee_id`,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Gross pay</Label>
                                            <Input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={entry.gross_pay}
                                                onChange={(event) =>
                                                    updateEntry(
                                                        entryIndex,
                                                        'gross_pay',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.gross_pay`,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Tax</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={entry.tax_amount}
                                                onChange={(event) =>
                                                    updateEntry(
                                                        entryIndex,
                                                        'tax_amount',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.tax_amount`,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>SSS</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={entry.sss_amount}
                                                onChange={(event) =>
                                                    updateEntry(
                                                        entryIndex,
                                                        'sss_amount',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.sss_amount`,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Pag-IBIG</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={entry.pagibig_amount}
                                                onChange={(event) =>
                                                    updateEntry(
                                                        entryIndex,
                                                        'pagibig_amount',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.pagibig_amount`,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>PhilHealth</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={entry.philhealth_amount}
                                                onChange={(event) =>
                                                    updateEntry(
                                                        entryIndex,
                                                        'philhealth_amount',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.philhealth_amount`,
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2 md:col-span-2 xl:col-span-3">
                                            <Label>Entry remarks</Label>
                                            <Textarea
                                                rows={2}
                                                value={entry.remarks}
                                                onChange={(event) =>
                                                    updateEntry(
                                                        entryIndex,
                                                        'remarks',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                placeholder="Optional notes for this employee line."
                                            />
                                            <InputError
                                                message={fieldError(
                                                    `entries.${entryIndex}.remarks`,
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                                        <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                Additional deductions
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {formatCurrency(
                                                    entryAdditionalDeductions(
                                                        entry,
                                                    ),
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                Total deductions
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {formatCurrency(
                                                    entryTotalDeductions(entry),
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 px-4 py-3">
                                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                                Net pay
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {formatCurrency(
                                                    entryNetPay(entry),
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-4 rounded-lg border border-dashed p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="font-medium">
                                                    Additional deductions
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Optional deductions beyond
                                                    the standard tax and
                                                    government contributions.
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    addDeduction(entryIndex)
                                                }
                                            >
                                                Add deduction
                                            </Button>
                                        </div>

                                        {entry.deductions.length === 0 && (
                                            <div className="rounded-md border border-dashed px-4 py-5 text-sm text-muted-foreground">
                                                No additional deductions for
                                                this employee line.
                                            </div>
                                        )}

                                        {entry.deductions.map(
                                            (deduction, deductionIndex) => (
                                                <div
                                                    key={`${entryIndex}-${deductionIndex}`}
                                                    className="grid gap-4 rounded-md border p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_1.4fr_auto]"
                                                >
                                                    <div className="grid gap-2">
                                                        <Label>Deduction</Label>
                                                        <Input
                                                            value={
                                                                deduction.deduction_name
                                                            }
                                                            onChange={(event) =>
                                                                updateDeduction(
                                                                    entryIndex,
                                                                    deductionIndex,
                                                                    'deduction_name',
                                                                    event
                                                                        .currentTarget
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Loan amortization"
                                                        />
                                                        <InputError
                                                            message={fieldError(
                                                                `entries.${entryIndex}.deductions.${deductionIndex}.deduction_name`,
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Amount</Label>
                                                        <Input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={
                                                                deduction.amount
                                                            }
                                                            onChange={(event) =>
                                                                updateDeduction(
                                                                    entryIndex,
                                                                    deductionIndex,
                                                                    'amount',
                                                                    event
                                                                        .currentTarget
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={fieldError(
                                                                `entries.${entryIndex}.deductions.${deductionIndex}.amount`,
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Remarks</Label>
                                                        <Input
                                                            value={
                                                                deduction.remarks
                                                            }
                                                            onChange={(event) =>
                                                                updateDeduction(
                                                                    entryIndex,
                                                                    deductionIndex,
                                                                    'remarks',
                                                                    event
                                                                        .currentTarget
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Optional note"
                                                        />
                                                        <InputError
                                                            message={fieldError(
                                                                `entries.${entryIndex}.deductions.${deductionIndex}.remarks`,
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                removeDeduction(
                                                                    entryIndex,
                                                                    deductionIndex,
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Save the payroll run now, then review it from the
                            detail page before downstream reporting work starts.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={form.processing}
                        >
                            {payrollRun
                                ? 'Save payroll run'
                                : 'Create payroll run'}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            asChild
                        >
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
