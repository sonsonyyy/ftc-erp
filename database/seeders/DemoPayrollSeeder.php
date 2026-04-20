<?php

namespace Database\Seeders;

use App\Actions\Payroll\SyncPayrollRunAction;
use App\Enums\EmploymentStatus;
use App\Enums\PayrollRunStatus;
use App\Models\Department;
use App\Models\Employee;
use App\Models\PayrollDeduction;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoPayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SyncPayrollRunAction $syncPayrollRunAction): void
    {
        PayrollDeduction::query()->delete();
        PayrollEntry::query()->delete();
        PayrollRun::query()->withTrashed()->forceDelete();
        Employee::query()->withTrashed()->forceDelete();
        Position::query()->withTrashed()->forceDelete();
        Department::query()->withTrashed()->forceDelete();

        $departments = [
            [
                'name' => 'Administration',
                'description' => 'Administrative, finance, and HR support.',
                'is_active' => true,
            ],
            [
                'name' => 'Operations',
                'description' => 'Project and service execution teams.',
                'is_active' => true,
            ],
            [
                'name' => 'Warehouse',
                'description' => 'Warehouse, staging, and material handling.',
                'is_active' => true,
            ],
            [
                'name' => 'Finance & Accounting',
                'description' => 'Billing, payroll, and financial support operations.',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $departmentData) {
            Department::query()->updateOrCreate(
                ['name' => $departmentData['name']],
                [
                    'description' => $departmentData['description'],
                    'is_active' => $departmentData['is_active'],
                ],
            );
        }

        $positions = [
            [
                'department' => 'Administration',
                'title' => 'HR and Payroll Officer',
                'description' => 'Handles employee records, payroll runs, and contribution support.',
                'is_active' => true,
            ],
            [
                'department' => 'Operations',
                'title' => 'Project Engineer',
                'description' => 'Coordinates awarded projects and site execution support.',
                'is_active' => true,
            ],
            [
                'department' => 'Operations',
                'title' => 'Service Technician',
                'description' => 'Executes preventive and corrective field jobs.',
                'is_active' => true,
            ],
            [
                'department' => 'Warehouse',
                'title' => 'Warehouse Custodian',
                'description' => 'Manages stock issuance, returns, and receiving coordination.',
                'is_active' => true,
            ],
            [
                'department' => 'Finance & Accounting',
                'title' => 'Accounting Assistant',
                'description' => 'Supports receivables, payroll reconciliation, and reporting.',
                'is_active' => true,
            ],
        ];

        foreach ($positions as $positionData) {
            Position::query()->updateOrCreate(
                [
                    'department_id' => $this->departmentId($positionData['department']),
                    'title' => $positionData['title'],
                ],
                [
                    'description' => $positionData['description'],
                    'is_active' => $positionData['is_active'],
                ],
            );
        }

        $employees = [
            [
                'employee_no' => 'EMP-10001',
                'first_name' => 'Nina',
                'last_name' => 'Garcia',
                'middle_name' => 'Lopez',
                'department' => 'Administration',
                'position' => 'HR and Payroll Officer',
                'employment_status' => EmploymentStatus::Regular->value,
                'hire_date' => '2024-07-01',
                'basic_salary' => '32000.00',
                'tin' => '123-456-789-000',
                'sss_no' => '34-5678901-2',
                'pagibig_no' => '1234-5678-9012',
                'philhealth_no' => '12-345678901-2',
                'email' => 'nina.garcia@example.com',
                'phone' => '+63 917 800 1001',
                'address' => 'Quezon City, Metro Manila',
                'is_active' => true,
            ],
            [
                'employee_no' => 'EMP-10002',
                'first_name' => 'Marco',
                'last_name' => 'Rivera',
                'middle_name' => null,
                'department' => 'Operations',
                'position' => 'Project Engineer',
                'employment_status' => EmploymentStatus::Regular->value,
                'hire_date' => '2023-09-15',
                'basic_salary' => '38000.00',
                'tin' => '123-456-789-101',
                'sss_no' => '34-5678901-3',
                'pagibig_no' => '1234-5678-9013',
                'philhealth_no' => '12-345678901-3',
                'email' => 'marco.rivera@example.com',
                'phone' => '+63 917 800 1002',
                'address' => 'Valenzuela City',
                'is_active' => true,
            ],
            [
                'employee_no' => 'EMP-10003',
                'first_name' => 'Jessa',
                'last_name' => 'Cruz',
                'middle_name' => null,
                'department' => 'Operations',
                'position' => 'Service Technician',
                'employment_status' => EmploymentStatus::Regular->value,
                'hire_date' => '2024-01-10',
                'basic_salary' => '24000.00',
                'tin' => '123-456-789-102',
                'sss_no' => '34-5678901-4',
                'pagibig_no' => '1234-5678-9014',
                'philhealth_no' => '12-345678901-4',
                'email' => 'jessa.cruz@example.com',
                'phone' => '+63 917 800 1003',
                'address' => 'Meycauayan, Bulacan',
                'is_active' => true,
            ],
            [
                'employee_no' => 'EMP-10004',
                'first_name' => 'Arvin',
                'last_name' => 'Santos',
                'middle_name' => null,
                'department' => 'Warehouse',
                'position' => 'Warehouse Custodian',
                'employment_status' => EmploymentStatus::Probationary->value,
                'hire_date' => '2025-11-05',
                'basic_salary' => '22000.00',
                'tin' => '123-456-789-103',
                'sss_no' => '34-5678901-5',
                'pagibig_no' => '1234-5678-9015',
                'philhealth_no' => '12-345678901-5',
                'email' => 'arvin.santos@example.com',
                'phone' => '+63 917 800 1004',
                'address' => 'Malabon City',
                'is_active' => true,
            ],
            [
                'employee_no' => 'EMP-10005',
                'first_name' => 'Bea',
                'last_name' => 'Navarro',
                'middle_name' => null,
                'department' => 'Finance & Accounting',
                'position' => 'Accounting Assistant',
                'employment_status' => EmploymentStatus::Regular->value,
                'hire_date' => '2023-05-20',
                'basic_salary' => '30000.00',
                'tin' => '123-456-789-104',
                'sss_no' => '34-5678901-6',
                'pagibig_no' => '1234-5678-9016',
                'philhealth_no' => '12-345678901-6',
                'email' => 'bea.navarro@example.com',
                'phone' => '+63 917 800 1005',
                'address' => 'Pasig City',
                'is_active' => true,
            ],
            [
                'employee_no' => 'EMP-10006',
                'first_name' => 'Lester',
                'last_name' => 'Domingo',
                'middle_name' => null,
                'department' => 'Operations',
                'position' => 'Service Technician',
                'employment_status' => EmploymentStatus::Contractual->value,
                'hire_date' => '2025-02-01',
                'basic_salary' => '21000.00',
                'tin' => '123-456-789-105',
                'sss_no' => '34-5678901-7',
                'pagibig_no' => '1234-5678-9017',
                'philhealth_no' => '12-345678901-7',
                'email' => 'lester.domingo@example.com',
                'phone' => '+63 917 800 1006',
                'address' => 'Marilao, Bulacan',
                'is_active' => false,
            ],
        ];

        foreach ($employees as $employeeData) {
            Employee::query()->updateOrCreate(
                ['employee_no' => $employeeData['employee_no']],
                [
                    'first_name' => $employeeData['first_name'],
                    'last_name' => $employeeData['last_name'],
                    'middle_name' => $employeeData['middle_name'],
                    'department_id' => $this->departmentId($employeeData['department']),
                    'position_id' => $this->positionId($employeeData['position'], $employeeData['department']),
                    'employment_status' => $employeeData['employment_status'],
                    'hire_date' => $employeeData['hire_date'],
                    'basic_salary' => $employeeData['basic_salary'],
                    'tin' => $employeeData['tin'],
                    'sss_no' => $employeeData['sss_no'],
                    'pagibig_no' => $employeeData['pagibig_no'],
                    'philhealth_no' => $employeeData['philhealth_no'],
                    'email' => $employeeData['email'],
                    'phone' => $employeeData['phone'],
                    'address' => $employeeData['address'],
                    'is_active' => $employeeData['is_active'],
                ],
            );
        }

        $hrUser = $this->userByEmail('hr@example.com');

        $syncPayrollRunAction->handle([
            'payroll_run_no' => 'PR-2026-0001',
            'period_from' => '2026-03-01',
            'period_to' => '2026-03-15',
            'payroll_date' => '2026-03-18',
            'status' => PayrollRunStatus::Processed->value,
            'remarks' => 'First-half March payroll prepared for admin, operations, and finance staff.',
            'entries' => [
                [
                    'employee_id' => $this->employeeId('EMP-10001'),
                    'gross_pay' => '16000.00',
                    'tax_amount' => '1200.00',
                    'sss_amount' => '320.00',
                    'pagibig_amount' => '160.00',
                    'philhealth_amount' => '240.00',
                    'remarks' => 'Standard semi-monthly payroll.',
                    'deductions' => [
                        [
                            'deduction_name' => 'Cash advance',
                            'amount' => '500.00',
                            'remarks' => 'Recovered in first-half payroll.',
                        ],
                    ],
                ],
                [
                    'employee_id' => $this->employeeId('EMP-10002'),
                    'gross_pay' => '19000.00',
                    'tax_amount' => '1600.00',
                    'sss_amount' => '380.00',
                    'pagibig_amount' => '190.00',
                    'philhealth_amount' => '285.00',
                    'remarks' => 'Project engineer semi-monthly payroll.',
                    'deductions' => [],
                ],
                [
                    'employee_id' => $this->employeeId('EMP-10005'),
                    'gross_pay' => '15000.00',
                    'tax_amount' => '1000.00',
                    'sss_amount' => '300.00',
                    'pagibig_amount' => '150.00',
                    'philhealth_amount' => '225.00',
                    'remarks' => 'Accounting support payroll.',
                    'deductions' => [
                        [
                            'deduction_name' => 'Uniform deduction',
                            'amount' => '250.00',
                            'remarks' => 'Final uniform cost recovery.',
                        ],
                    ],
                ],
            ],
        ], null, $hrUser);

        $syncPayrollRunAction->handle([
            'payroll_run_no' => 'PR-2026-0002',
            'period_from' => '2026-03-16',
            'period_to' => '2026-03-31',
            'payroll_date' => '2026-04-03',
            'status' => PayrollRunStatus::Draft->value,
            'remarks' => 'Second-half March payroll draft awaiting final HR review.',
            'entries' => [
                [
                    'employee_id' => $this->employeeId('EMP-10003'),
                    'gross_pay' => '12000.00',
                    'tax_amount' => '650.00',
                    'sss_amount' => '240.00',
                    'pagibig_amount' => '120.00',
                    'philhealth_amount' => '180.00',
                    'remarks' => 'Technician draft payroll entry.',
                    'deductions' => [],
                ],
                [
                    'employee_id' => $this->employeeId('EMP-10004'),
                    'gross_pay' => '11000.00',
                    'tax_amount' => '500.00',
                    'sss_amount' => '220.00',
                    'pagibig_amount' => '110.00',
                    'philhealth_amount' => '165.00',
                    'remarks' => 'Warehouse draft payroll entry.',
                    'deductions' => [
                        [
                            'deduction_name' => 'Loan amortization',
                            'amount' => '600.00',
                            'remarks' => 'Monthly cooperative loan recovery.',
                        ],
                    ],
                ],
            ],
        ], null, $hrUser);
    }

    /**
     * Resolve a department identifier from its name.
     */
    private function departmentId(string $name): int
    {
        $departmentId = Department::query()
            ->where('name', $name)
            ->value('id');

        if ($departmentId === null) {
            throw new RuntimeException("Department [{$name}] was not found while seeding payroll.");
        }

        return (int) $departmentId;
    }

    /**
     * Resolve a position identifier from its title and department.
     */
    private function positionId(string $title, string $departmentName): int
    {
        $positionId = Position::query()
            ->where('title', $title)
            ->where('department_id', $this->departmentId($departmentName))
            ->value('id');

        if ($positionId === null) {
            throw new RuntimeException("Position [{$title}] was not found while seeding payroll.");
        }

        return (int) $positionId;
    }

    /**
     * Resolve an employee identifier from an employee number.
     */
    private function employeeId(string $employeeNo): int
    {
        $employeeId = Employee::query()
            ->where('employee_no', $employeeNo)
            ->value('id');

        if ($employeeId === null) {
            throw new RuntimeException("Employee [{$employeeNo}] was not found while seeding payroll.");
        }

        return (int) $employeeId;
    }

    /**
     * Resolve a user by email.
     */
    private function userByEmail(string $email): User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            throw new RuntimeException("User [{$email}] was not found while seeding payroll.");
        }

        return $user;
    }
}
