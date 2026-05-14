<?php

use App\Enums\EmploymentStatus;
use App\Enums\PayrollRunStatus;
use App\Models\Department;
use App\Models\Employee;
use App\Models\PayrollDeduction;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

if (! function_exists('actingAsSuperAdmin')) {
    function actingAsSuperAdmin(): User
    {
        $user = User::factory()->create();
        $role = Role::query()->where('name', Role::SUPER_ADMIN)->firstOrFail();

        $user->roles()->sync([$role->getKey()]);

        test()->actingAs($user);

        return $user;
    }
}

function actingAsHrOfficer(): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', 'HR / Payroll Officer')->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('hr users can browse paginated and filtered departments', function () {
    actingAsHrOfficer();

    Department::factory()->count(14)->create();
    Department::factory()->create([
        'name' => 'Administration',
        'is_active' => true,
    ]);
    Department::factory()->create([
        'name' => 'Dormant Department',
        'is_active' => false,
    ]);

    $this->get(route('departments.index', [
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('departments/index')
            ->where('departments.current_page', 1)
            ->has('departments.data', 5)
            ->where('filters.per_page', 5)
            ->where('can.create', true),
        );

    $this->get(route('departments.index', [
        'search' => 'administration',
        'active' => 'active',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('departments/index')
            ->where('filters.search', 'administration')
            ->where('filters.active', 'active')
            ->where('filters.per_page', 5)
            ->where('departments.total', 1)
            ->where('departments.data.0.name', 'Administration'),
        );
});

test('hr users can create update and archive departments', function () {
    actingAsHrOfficer();

    $response = $this->post(route('departments.store'), [
        'name' => 'Human Resources',
        'description' => 'Handles employee administration.',
        'is_active' => true,
    ]);

    $department = Department::query()->where('name', 'Human Resources')->firstOrFail();

    $response->assertRedirect(route('departments.edit', $department));

    $this->put(route('departments.update', $department), [
        'name' => 'People Operations',
        'description' => 'Updated department description.',
        'is_active' => false,
    ])->assertRedirect(route('departments.edit', $department));

    $department->refresh();

    expect($department->name)->toBe('People Operations');
    expect($department->is_active)->toBeFalse();

    $this->delete(route('departments.destroy', $department))
        ->assertRedirect(route('departments.index'));

    $this->assertSoftDeleted($department);
});

test('hr users can create filter update and archive positions', function () {
    actingAsHrOfficer();

    $administration = Department::factory()->create([
        'name' => 'Administration',
        'is_active' => true,
    ]);
    $operations = Department::factory()->create([
        'name' => 'Operations',
        'is_active' => true,
    ]);

    $response = $this->post(route('positions.store'), [
        'department_id' => $administration->getKey(),
        'title' => 'Payroll Officer',
        'description' => 'Handles payroll preparation.',
        'is_active' => true,
    ]);

    $position = Position::query()
        ->where('title', 'Payroll Officer')
        ->where('department_id', $administration->getKey())
        ->firstOrFail();

    $response->assertRedirect(route('positions.edit', $position));

    Position::factory()->create([
        'department_id' => $operations->getKey(),
        'title' => 'Field Technician',
        'is_active' => true,
    ]);

    $this->get(route('positions.index', [
        'search' => 'payroll',
        'department' => $administration->getKey(),
        'active' => 'active',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('positions/index')
            ->where('positions.total', 1)
            ->where('filters.search', 'payroll')
            ->where('positions.data.0.title', 'Payroll Officer')
            ->where('filters.department', $administration->getKey())
            ->where('filters.per_page', 5),
        );

    $this->put(route('positions.update', $position), [
        'department_id' => $administration->getKey(),
        'title' => 'Senior Payroll Officer',
        'description' => 'Updated title and role scope.',
        'is_active' => false,
    ])->assertRedirect(route('positions.edit', $position));

    $position->refresh();

    expect($position->title)->toBe('Senior Payroll Officer');
    expect($position->is_active)->toBeFalse();

    $this->delete(route('positions.destroy', $position))
        ->assertRedirect(route('positions.index'));

    $this->assertSoftDeleted($position);
});

test('employee validation requires unique values and matching department position assignments', function () {
    actingAsHrOfficer();

    $administration = Department::factory()->create();
    $operations = Department::factory()->create();
    $position = Position::factory()->create([
        'department_id' => $administration->getKey(),
    ]);

    Employee::factory()->create([
        'employee_no' => 'EMP-77777',
        'email' => 'duplicate-employee@example.com',
    ]);

    $this->from(route('employees.create'))
        ->post(route('employees.store'), [
            'employee_no' => 'EMP-77777',
            'first_name' => 'Jamie',
            'last_name' => 'Mismatch',
            'middle_name' => null,
            'department_id' => $operations->getKey(),
            'position_id' => $position->getKey(),
            'employment_status' => EmploymentStatus::Regular->value,
            'hire_date' => '2026-04-01',
            'basic_salary' => 22000,
            'tin' => null,
            'sss_no' => null,
            'pagibig_no' => null,
            'philhealth_no' => null,
            'email' => 'duplicate-employee@example.com',
            'phone' => null,
            'address' => null,
            'is_active' => true,
        ])
        ->assertRedirect(route('employees.create'))
        ->assertSessionHasErrors([
            'employee_no',
            'email',
            'position_id',
        ]);
});

test('hr users can filter create update and archive employees', function () {
    actingAsHrOfficer();

    $operations = Department::factory()->create([
        'name' => 'Operations',
        'is_active' => true,
    ]);
    $finance = Department::factory()->create([
        'name' => 'Finance',
        'is_active' => true,
    ]);
    $technician = Position::factory()->create([
        'department_id' => $operations->getKey(),
        'title' => 'Service Technician',
        'is_active' => true,
    ]);
    $seniorTechnician = Position::factory()->create([
        'department_id' => $operations->getKey(),
        'title' => 'Senior Service Technician',
        'is_active' => true,
    ]);
    $financeAssistant = Position::factory()->create([
        'department_id' => $finance->getKey(),
        'title' => 'Finance Assistant',
        'is_active' => true,
    ]);

    Employee::factory()->create([
        'employee_no' => 'EMP-10010',
        'first_name' => 'Alicia',
        'last_name' => 'Cruz',
        'department_id' => $operations->getKey(),
        'position_id' => $technician->getKey(),
        'employment_status' => EmploymentStatus::Regular,
        'is_active' => true,
        'email' => 'alicia@example.com',
    ]);
    Employee::factory()->create([
        'employee_no' => 'EMP-10011',
        'first_name' => 'Inactive',
        'last_name' => 'Technician',
        'department_id' => $operations->getKey(),
        'position_id' => $technician->getKey(),
        'employment_status' => EmploymentStatus::Regular,
        'is_active' => false,
        'email' => 'inactive-tech@example.com',
    ]);
    Employee::factory()->create([
        'employee_no' => 'EMP-10012',
        'first_name' => 'Finn',
        'last_name' => 'Accounting',
        'department_id' => $finance->getKey(),
        'position_id' => $financeAssistant->getKey(),
        'employment_status' => EmploymentStatus::Probationary,
        'is_active' => true,
        'email' => 'finn-accounting@example.com',
    ]);

    $this->get(route('employees.index', [
        'search' => 'alicia',
        'department' => $operations->getKey(),
        'position' => $technician->getKey(),
        'employment_status' => EmploymentStatus::Regular->value,
        'active' => 'active',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->where('employees.total', 1)
            ->where('employees.data.0.employee_no', 'EMP-10010')
            ->where('filters.search', 'alicia')
            ->where('filters.department', $operations->getKey())
            ->where('filters.position', $technician->getKey())
            ->where('filters.per_page', 5)
            ->where('summary.total_employees', 3)
            ->where('summary.active_employees', 2)
            ->where('summary.inactive_employees', 1)
            ->where('summary.assigned_departments', 2),
        );

    $response = $this->post(route('employees.store'), [
        'employee_no' => 'EMP-10020',
        'first_name' => 'Mika',
        'last_name' => 'Santos',
        'middle_name' => 'Lopez',
        'department_id' => $operations->getKey(),
        'position_id' => $technician->getKey(),
        'employment_status' => EmploymentStatus::Regular->value,
        'hire_date' => '2026-04-10',
        'basic_salary' => 25000,
        'tin' => '123-456-789-000',
        'sss_no' => '34-5678901-2',
        'pagibig_no' => '1234-5678-9012',
        'philhealth_no' => '12-345678901-2',
        'email' => 'mika.santos@example.com',
        'phone' => '+63 917 123 4567',
        'address' => 'Quezon City',
        'is_active' => true,
    ]);

    $employee = Employee::query()->where('employee_no', 'EMP-10020')->firstOrFail();

    $response->assertRedirect(route('employees.show', $employee));

    $this->put(route('employees.update', $employee), [
        'employee_no' => 'EMP-10020',
        'first_name' => 'Mika',
        'last_name' => 'Santos',
        'middle_name' => 'Lopez',
        'department_id' => $operations->getKey(),
        'position_id' => $seniorTechnician->getKey(),
        'employment_status' => EmploymentStatus::ProjectBased->value,
        'hire_date' => '2026-04-10',
        'basic_salary' => 27500,
        'tin' => '123-456-789-000',
        'sss_no' => '34-5678901-2',
        'pagibig_no' => '1234-5678-9012',
        'philhealth_no' => '12-345678901-2',
        'email' => 'mika.updated@example.com',
        'phone' => '+63 917 123 4567',
        'address' => 'Quezon City',
        'is_active' => false,
    ])->assertRedirect(route('employees.show', $employee));

    $employee->refresh();

    expect($employee->position_id)->toBe($seniorTechnician->getKey());
    expect($employee->employment_status)->toBe(EmploymentStatus::ProjectBased);
    expect((float) $employee->basic_salary)->toBe(27500.0);
    expect($employee->is_active)->toBeFalse();

    $this->delete(route('employees.destroy', $employee))
        ->assertRedirect(route('employees.index'));

    $this->assertSoftDeleted($employee);
});

test('hr users can create filter update and archive payroll runs', function () {
    $hrUser = actingAsHrOfficer();

    $department = Department::factory()->create([
        'name' => 'Operations',
        'is_active' => true,
    ]);
    $position = Position::factory()->create([
        'department_id' => $department->getKey(),
        'title' => 'Service Technician',
        'is_active' => true,
    ]);
    $employeeOne = Employee::factory()->create([
        'employee_no' => 'EMP-20001',
        'department_id' => $department->getKey(),
        'position_id' => $position->getKey(),
        'is_active' => true,
        'basic_salary' => 30000,
    ]);
    $employeeTwo = Employee::factory()->create([
        'employee_no' => 'EMP-20002',
        'department_id' => $department->getKey(),
        'position_id' => $position->getKey(),
        'is_active' => true,
        'basic_salary' => 28000,
    ]);

    $response = $this->post(route('payroll-runs.store'), [
        'payroll_run_no' => 'PR-2026-0009',
        'period_from' => '2026-04-01',
        'period_to' => '2026-04-15',
        'payroll_date' => '2026-04-18',
        'status' => PayrollRunStatus::Draft->value,
        'remarks' => 'Mid-month payroll batch.',
        'entries' => [
            [
                'employee_id' => $employeeOne->getKey(),
                'gross_pay' => 30000,
                'tax_amount' => 1500,
                'sss_amount' => 600,
                'pagibig_amount' => 300,
                'philhealth_amount' => 450,
                'remarks' => 'Complete attendance.',
                'deductions' => [
                    [
                        'deduction_name' => 'Cash advance',
                        'amount' => 1000,
                        'remarks' => 'April cash advance recovery.',
                    ],
                ],
            ],
            [
                'employee_id' => $employeeTwo->getKey(),
                'gross_pay' => 28000,
                'tax_amount' => 1400,
                'sss_amount' => 560,
                'pagibig_amount' => 280,
                'philhealth_amount' => 420,
                'remarks' => null,
                'deductions' => [],
            ],
        ],
    ]);

    $payrollRun = PayrollRun::query()->where('payroll_run_no', 'PR-2026-0009')->firstOrFail();

    $response->assertRedirect(route('payroll-runs.show', $payrollRun));

    $payrollRun->refresh();

    expect($payrollRun->status)->toBe(PayrollRunStatus::Draft);
    expect((float) $payrollRun->gross_total)->toBe(58000.0);
    expect((float) $payrollRun->total_deductions)->toBe(6510.0);
    expect((float) $payrollRun->net_total)->toBe(51490.0);
    expect($payrollRun->prepared_by_user_id)->toBe($hrUser->getKey());
    expect(PayrollEntry::query()->where('payroll_run_id', $payrollRun->getKey())->count())->toBe(2);
    expect(PayrollDeduction::query()->count())->toBe(1);

    $this->get(route('payroll-runs.index', [
        'search' => 'pr-2026-0009',
        'status' => PayrollRunStatus::Draft->value,
        'from' => '2026-04-01',
        'to' => '2026-04-30',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('payroll-runs/index')
            ->where('filters.search', 'pr-2026-0009')
            ->where('filters.per_page', 5)
            ->where('payrollRuns.total', 1)
            ->where('payrollRuns.data.0.payroll_run_no', 'PR-2026-0009')
            ->where('payrollRuns.data.0.entry_count', 2),
        );

    $this->put(route('payroll-runs.update', $payrollRun), [
        'payroll_run_no' => 'PR-2026-0009',
        'period_from' => '2026-04-01',
        'period_to' => '2026-04-15',
        'payroll_date' => '2026-04-19',
        'status' => PayrollRunStatus::Processed->value,
        'remarks' => 'Processed after HR approval.',
        'entries' => [
            [
                'employee_id' => $employeeOne->getKey(),
                'gross_pay' => 32000,
                'tax_amount' => 1600,
                'sss_amount' => 640,
                'pagibig_amount' => 320,
                'philhealth_amount' => 480,
                'remarks' => 'Adjusted overtime payout.',
                'deductions' => [],
            ],
        ],
    ])->assertRedirect(route('payroll-runs.show', $payrollRun));

    $payrollRun->refresh();

    expect($payrollRun->status)->toBe(PayrollRunStatus::Processed);
    expect((float) $payrollRun->gross_total)->toBe(32000.0);
    expect((float) $payrollRun->total_deductions)->toBe(3040.0);
    expect((float) $payrollRun->net_total)->toBe(28960.0);
    expect(PayrollEntry::query()->where('payroll_run_id', $payrollRun->getKey())->count())->toBe(1);
    expect(PayrollDeduction::query()->count())->toBe(0);

    $this->delete(route('payroll-runs.destroy', $payrollRun))
        ->assertRedirect(route('payroll-runs.index'));

    $this->assertSoftDeleted($payrollRun);
});

test('payroll run validation rejects inactive employees and excessive deductions', function () {
    actingAsHrOfficer();

    $department = Department::factory()->create(['is_active' => true]);
    $position = Position::factory()->create([
        'department_id' => $department->getKey(),
        'is_active' => true,
    ]);
    $inactiveEmployee = Employee::factory()->create([
        'department_id' => $department->getKey(),
        'position_id' => $position->getKey(),
        'is_active' => false,
    ]);

    $this->from(route('payroll-runs.create'))
        ->post(route('payroll-runs.store'), [
            'payroll_run_no' => 'PR-2026-0010',
            'period_from' => '2026-04-01',
            'period_to' => '2026-04-15',
            'payroll_date' => '2026-04-18',
            'status' => PayrollRunStatus::Draft->value,
            'remarks' => null,
            'entries' => [
                [
                    'employee_id' => $inactiveEmployee->getKey(),
                    'gross_pay' => 1000,
                    'tax_amount' => 900,
                    'sss_amount' => 100,
                    'pagibig_amount' => 50,
                    'philhealth_amount' => 30,
                    'remarks' => null,
                    'deductions' => [
                        [
                            'deduction_name' => 'Penalty',
                            'amount' => 20,
                            'remarks' => null,
                        ],
                    ],
                ],
            ],
        ])
        ->assertRedirect(route('payroll-runs.create'))
        ->assertSessionHasErrors([
            'entries.0.employee_id',
            'entries.0.gross_pay',
        ]);
});

test('users without payroll permissions cannot manage payroll records', function () {
    $department = Department::factory()->create();
    $position = Position::factory()->create([
        'department_id' => $department->getKey(),
    ]);
    $employee = Employee::factory()->create([
        'department_id' => $department->getKey(),
        'position_id' => $position->getKey(),
        'is_active' => true,
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('departments.index'))
        ->assertForbidden();

    $this->post(route('employees.store'), [
        'employee_no' => 'EMP-30001',
        'first_name' => 'Unauthorized',
        'last_name' => 'Employee',
        'middle_name' => null,
        'department_id' => $department->getKey(),
        'position_id' => $position->getKey(),
        'employment_status' => EmploymentStatus::Regular->value,
        'hire_date' => '2026-04-01',
        'basic_salary' => 20000,
        'tin' => null,
        'sss_no' => null,
        'pagibig_no' => null,
        'philhealth_no' => null,
        'email' => 'unauthorized.employee@example.com',
        'phone' => null,
        'address' => null,
        'is_active' => true,
    ])->assertForbidden();

    $this->post(route('payroll-runs.store'), [
        'payroll_run_no' => 'PR-2026-0099',
        'period_from' => '2026-04-01',
        'period_to' => '2026-04-15',
        'payroll_date' => '2026-04-18',
        'status' => PayrollRunStatus::Draft->value,
        'remarks' => null,
        'entries' => [
            [
                'employee_id' => $employee->getKey(),
                'gross_pay' => 20000,
                'tax_amount' => 1000,
                'sss_amount' => 400,
                'pagibig_amount' => 200,
                'philhealth_amount' => 300,
                'remarks' => null,
                'deductions' => [],
            ],
        ],
    ])->assertForbidden();
});
