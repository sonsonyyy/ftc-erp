import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import EmployeeController from '@/actions/App/Http/Controllers/Payroll/EmployeeController';
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
    EmployeeDetail,
    EmployeeFormDefaults,
    PositionOption,
    SelectOption,
} from '@/types';
import { SelectInput } from '@/components/ui/select-input';

type Props = {
    employee?: EmployeeDetail;
    departmentOptions: SelectOption[];
    positionOptions: PositionOption[];
    employmentStatusOptions: SelectOption[];
    defaults?: EmployeeFormDefaults;
    title: string;
    description: string;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
};

export function EmployeeForm({
    employee,
    departmentOptions,
    positionOptions,
    employmentStatusOptions,
    defaults,
    title,
    description,
    cancelHref,
}: Props) {
    const form = useForm({
        employee_no: employee?.employee_no ?? defaults?.employee_no ?? '',
        first_name: employee?.first_name ?? '',
        last_name: employee?.last_name ?? '',
        middle_name: employee?.middle_name ?? '',
        department_id: employee?.department_id
            ? String(employee.department_id)
            : '',
        position_id: employee?.position_id ? String(employee.position_id) : '',
        employment_status:
            employee?.employment_status ??
            defaults?.employment_status ??
            'regular',
        hire_date: employee?.hire_date ?? '',
        basic_salary:
            employee?.basic_salary === null ||
            employee?.basic_salary === undefined
                ? ''
                : String(employee.basic_salary),
        tin: employee?.tin ?? '',
        sss_no: employee?.sss_no ?? '',
        pagibig_no: employee?.pagibig_no ?? '',
        philhealth_no: employee?.philhealth_no ?? '',
        email: employee?.email ?? '',
        phone: employee?.phone ?? '',
        address: employee?.address ?? '',
        is_active: employee
            ? employee.is_active
                ? '1'
                : '0'
            : defaults?.is_active === false
              ? '0'
              : '1',
    });

    function handlePositionChange(value: string) {
        form.setData('position_id', value);

        const position = positionOptions.find(
            (option) => String(option.value) === value,
        );

        if (position?.department_id) {
            form.setData('department_id', String(position.department_id));
        }
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            employee_no: data.employee_no,
            first_name: data.first_name,
            last_name: data.last_name,
            middle_name: data.middle_name || null,
            department_id:
                data.department_id === '' ? null : Number(data.department_id),
            position_id:
                data.position_id === '' ? null : Number(data.position_id),
            employment_status: data.employment_status,
            hire_date: data.hire_date || null,
            basic_salary:
                data.basic_salary === '' ? null : Number(data.basic_salary),
            tin: data.tin || null,
            sss_no: data.sss_no || null,
            pagibig_no: data.pagibig_no || null,
            philhealth_no: data.philhealth_no || null,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            is_active: data.is_active === '1',
        }));

        if (employee) {
            form.submit(EmployeeController.update(employee.id), {
                preserveScroll: true,
            });

            return;
        }

        form.submit(EmployeeController.store(), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-6">
            <Heading title={title} description={description} />

            <form
                onSubmit={submit}
                className="grid gap-6 xl:grid-cols-[2fr_1fr]"
            >
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee masterfile</CardTitle>
                            <CardDescription>
                                Capture the internal employee reference,
                                assignment, and payroll-ready contact data.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="employee_no">
                                    Employee no.
                                </Label>
                                <Input
                                    id="employee_no"
                                    value={form.data.employee_no}
                                    onChange={(event) =>
                                        form.setData(
                                            'employee_no',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.employee_no} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="employment_status">
                                    Employment status
                                </Label>
                                <SelectInput
                                    id="employment_status"
                                    value={form.data.employment_status}
                                    onChange={(event) =>
                                        form.setData(
                                            'employment_status',
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    {employmentStatusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError
                                    message={form.errors.employment_status}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name</Label>
                                <Input
                                    id="first_name"
                                    value={form.data.first_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'first_name',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last name</Label>
                                <Input
                                    id="last_name"
                                    value={form.data.last_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'last_name',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.last_name} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="middle_name">Middle name</Label>
                                <Input
                                    id="middle_name"
                                    value={form.data.middle_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'middle_name',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.middle_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="department_id">
                                    Department
                                </Label>
                                <SelectInput
                                    id="department_id"
                                    value={form.data.department_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'department_id',
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="">
                                        No department assigned
                                    </option>
                                    {departmentOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError
                                    message={form.errors.department_id}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="position_id">Position</Label>
                                <SelectInput
                                    id="position_id"
                                    value={form.data.position_id}
                                    onChange={(event) =>
                                        handlePositionChange(
                                            event.currentTarget.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <option value="">
                                        No position assigned
                                    </option>
                                    {positionOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={form.errors.position_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="hire_date">Hire date</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={form.data.hire_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'hire_date',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.hire_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="basic_salary">
                                    Basic salary
                                </Label>
                                <Input
                                    id="basic_salary"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.data.basic_salary}
                                    onChange={(event) =>
                                        form.setData(
                                            'basic_salary',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.basic_salary}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Government and contact details
                            </CardTitle>
                            <CardDescription>
                                Keep the statutory ID set complete early so
                                payroll and later tax reporting stay traceable.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="tin">TIN</Label>
                                <Input
                                    id="tin"
                                    value={form.data.tin}
                                    onChange={(event) =>
                                        form.setData(
                                            'tin',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.tin} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sss_no">SSS no.</Label>
                                <Input
                                    id="sss_no"
                                    value={form.data.sss_no}
                                    onChange={(event) =>
                                        form.setData(
                                            'sss_no',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.sss_no} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pagibig_no">Pag-IBIG no.</Label>
                                <Input
                                    id="pagibig_no"
                                    value={form.data.pagibig_no}
                                    onChange={(event) =>
                                        form.setData(
                                            'pagibig_no',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.pagibig_no} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="philhealth_no">
                                    PhilHealth no.
                                </Label>
                                <Input
                                    id="philhealth_no"
                                    value={form.data.philhealth_no}
                                    onChange={(event) =>
                                        form.setData(
                                            'philhealth_no',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.philhealth_no}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.phone} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    rows={3}
                                    value={form.data.address}
                                    onChange={(event) =>
                                        form.setData(
                                            'address',
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.address} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>
                            Control whether the employee remains available for
                            new payroll runs.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Status</Label>
                            <SelectInput
                                id="is_active"
                                value={form.data.is_active}
                                onChange={(event) =>
                                    form.setData(
                                        'is_active',
                                        event.currentTarget.value,
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </SelectInput>
                            <InputError message={form.errors.is_active} />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                {employee ? 'Save employee' : 'Create employee'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href={cancelHref}>Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
