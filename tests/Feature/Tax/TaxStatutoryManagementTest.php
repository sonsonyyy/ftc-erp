<?php

use App\Enums\InvoiceStatus;
use App\Enums\PayrollRunStatus;
use App\Enums\TaxReportType;
use App\Enums\VatRecordType;
use App\Enums\WithholdingRecordType;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\Role;
use App\Models\TaxReportRun;
use App\Models\User;
use App\Models\VatRecord;
use App\Models\WithholdingRecord;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->withoutVite();
});

function taxActingAsRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

function taxEmployee(array $overrides = []): Employee
{
    $department = Department::factory()->create([
        'name' => 'Finance & Accounting',
        'is_active' => true,
    ]);
    $position = Position::factory()->create([
        'department_id' => $department->getKey(),
        'title' => 'Payroll Analyst',
        'is_active' => true,
    ]);

    return Employee::factory()->create(array_merge([
        'department_id' => $department->getKey(),
        'position_id' => $position->getKey(),
        'employee_no' => 'EMP-TAX-1001',
        'first_name' => 'Nina',
        'last_name' => 'Garcia',
        'middle_name' => null,
        'email' => 'nina.tax@example.com',
        'tin' => '123-456-789-000',
        'is_active' => true,
    ], $overrides));
}

test('authorized users can browse and filter tax source pages', function () {
    taxActingAsRole('Billing / Accounting Staff');

    WithholdingRecord::factory()->count(14)->create();
    WithholdingRecord::factory()->create([
        'record_type' => WithholdingRecordType::CompensationWithholding,
        'record_date' => '2026-03-18',
        'reference_no' => 'PR-TAX-0001',
        'subject_name' => 'Nina Garcia',
        'subject_tin' => '123-456-789-000',
        'subject_identifier' => 'EMP-TAX-1001',
    ]);
    WithholdingRecord::factory()->create([
        'record_type' => WithholdingRecordType::SssContribution,
        'record_date' => '2026-01-12',
        'reference_no' => 'PR-TAX-0002',
        'subject_name' => 'Dormant User',
    ]);

    VatRecord::factory()->create([
        'record_type' => VatRecordType::OutputVat,
        'record_date' => '2026-04-10',
        'reference_no' => 'INV-TAX-0001',
        'counterparty_name' => 'Metro Fire Systems',
        'counterparty_tin' => '321-654-987-000',
    ]);
    VatRecord::factory()->create([
        'record_type' => VatRecordType::InputVat,
        'record_date' => '2026-01-05',
        'reference_no' => 'BILL-TAX-0001',
        'counterparty_name' => 'Dormant Supplier',
    ]);

    $this->get(route('withholding-records.index', [
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('withholding-records/index')
            ->where('withholdingRecords.current_page', 1)
            ->has('withholdingRecords.data', 5)
            ->where('filters.per_page', 5)
            ->where('can.generate_reports', true));

    $this->get(route('withholding-records.index', [
        'search' => 'nina',
        'type' => WithholdingRecordType::CompensationWithholding->value,
        'from' => '2026-03-01',
        'to' => '2026-03-31',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('withholding-records/index')
            ->where('filters.search', 'nina')
            ->where('filters.type', WithholdingRecordType::CompensationWithholding->value)
            ->where('filters.per_page', 5)
            ->where('withholdingRecords.total', 1)
            ->where('withholdingRecords.data.0.reference_no', 'PR-TAX-0001'));

    $this->get(route('vat-records.index', [
        'search' => 'metro fire',
        'type' => VatRecordType::OutputVat->value,
        'from' => '2026-04-01',
        'to' => '2026-04-30',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('vat-records/index')
            ->where('filters.search', 'metro fire')
            ->where('filters.type', VatRecordType::OutputVat->value)
            ->where('filters.per_page', 5)
            ->where('vatRecords.total', 1)
            ->where('vatRecords.data.0.reference_no', 'INV-TAX-0001'));
});

test('tax report runs can be filtered reviewed generated and archived', function () {
    $billingUser = taxActingAsRole('Billing / Accounting Staff');

    $employee = taxEmployee();
    $customer = Customer::factory()->create([
        'customer_code' => 'CUST-TAX-0001',
        'company_name' => 'Metro Fire Systems',
        'tin' => '321-654-987-000',
    ]);

    $payrollRun = PayrollRun::factory()->create([
        'payroll_run_no' => 'PR-TAX-2026-0001',
        'period_from' => '2026-03-01',
        'period_to' => '2026-03-15',
        'payroll_date' => '2026-03-18',
        'status' => PayrollRunStatus::Processed,
        'prepared_by_user_id' => $billingUser->getKey(),
        'gross_total' => 25000,
        'total_deductions' => 2725,
        'net_total' => 22275,
    ]);

    $payrollRun->entries()->create([
        'employee_id' => $employee->getKey(),
        'gross_pay' => 25000,
        'tax_amount' => 1800,
        'sss_amount' => 500,
        'pagibig_amount' => 175,
        'philhealth_amount' => 250,
        'other_deductions_amount' => 0,
        'total_deductions' => 2725,
        'net_pay' => 22275,
    ]);

    Invoice::query()->create([
        'invoice_no' => 'INV-TAX-2026-0001',
        'customer_id' => $customer->getKey(),
        'issued_by_user_id' => $billingUser->getKey(),
        'invoice_date' => '2026-04-15',
        'due_date' => '2026-05-15',
        'subtotal' => 1500,
        'tax_amount' => 180,
        'total_amount' => 1680,
        'balance_amount' => 1680,
        'status' => InvoiceStatus::Issued,
        'remarks' => 'Issued VAT invoice for tax module test.',
    ]);

    TaxReportRun::factory()->count(14)->create();
    $manualRun = TaxReportRun::factory()->create([
        'report_no' => 'TAX-1601C-MANUAL-001',
        'report_type' => TaxReportType::Form1601C,
        'period_from' => '2026-03-01',
        'period_to' => '2026-03-31',
        'remarks' => 'Manual March withholding snapshot',
        'generated_by_user_id' => $billingUser->getKey(),
    ]);
    $manualRun->items()->create([
        'source_record_type' => 'withholding_record',
        'source_record_id' => 999001,
        'line_type' => WithholdingRecordType::CompensationWithholding->value,
        'record_date' => '2026-03-18',
        'reference_no' => 'PR-MANUAL-001',
        'subject_name' => 'Manual Nina Garcia',
        'subject_tin' => '123-456-789-000',
        'base_amount' => 20000,
        'amount' => 1600,
        'vat_amount' => 0,
        'gross_amount' => 20000,
        'payload' => [
            'employee_id' => $employee->getKey(),
            'payroll_run_id' => $payrollRun->getKey(),
            'payroll_run_no' => $payrollRun->payroll_run_no,
        ],
    ]);
    $manualRun->update([
        'item_count' => 1,
        'base_amount_total' => 20000,
        'amount_total' => 1600,
    ]);

    $this->get(route('tax-report-runs.index', [
        'search' => 'manual-001',
        'type' => TaxReportType::Form1601C->value,
        'from' => '2026-03-01',
        'to' => '2026-03-31',
        'per_page' => 5,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tax-report-runs/index')
            ->where('filters.search', 'manual-001')
            ->where('filters.type', TaxReportType::Form1601C->value)
            ->where('filters.per_page', 5)
            ->where('taxReportRuns.total', 1)
            ->where('taxReportRuns.data.0.report_no', 'TAX-1601C-MANUAL-001'));

    $this->get(route('tax-report-runs.show', $manualRun))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tax-report-runs/show')
            ->where('taxReportRun.report_no', 'TAX-1601C-MANUAL-001')
            ->where('taxReportRun.item_count', 1)
            ->where('taxReportRun.items.0.reference_no', 'PR-MANUAL-001'));

    $this->post(route('tax-report-runs.store'), [
        'report_type' => TaxReportType::Form1601C->value,
        'period_from' => '2026-03-01',
        'period_to' => '2026-03-31',
        'remarks' => 'March payroll withholding snapshot',
    ])->assertRedirect();

    $withholdingRun = TaxReportRun::query()
        ->where('report_type', TaxReportType::Form1601C->value)
        ->where('remarks', 'March payroll withholding snapshot')
        ->firstOrFail();

    expect($withholdingRun->generated_by_user_id)->toBe($billingUser->getKey());
    expect($withholdingRun->item_count)->toBe(1);
    expect((float) $withholdingRun->base_amount_total)->toBe(25000.0);
    expect((float) $withholdingRun->amount_total)->toBe(1800.0);
    expect(WithholdingRecord::query()->where('reference_no', 'PR-TAX-2026-0001')->count())->toBe(4);

    $this->post(route('tax-report-runs.store'), [
        'report_type' => TaxReportType::VatSummary->value,
        'period_from' => '2026-04-01',
        'period_to' => '2026-04-30',
        'remarks' => 'April VAT summary snapshot',
    ])->assertRedirect();

    $vatRun = TaxReportRun::query()
        ->where('report_type', TaxReportType::VatSummary->value)
        ->where('remarks', 'April VAT summary snapshot')
        ->firstOrFail();

    expect($vatRun->item_count)->toBe(1);
    expect((float) $vatRun->base_amount_total)->toBe(1500.0);
    expect((float) $vatRun->vat_amount_total)->toBe(180.0);
    expect((float) $vatRun->gross_amount_total)->toBe(1680.0);
    expect(VatRecord::query()->where('reference_no', 'INV-TAX-2026-0001')->count())->toBe(1);

    $this->delete(route('tax-report-runs.destroy', $vatRun))
        ->assertRedirect(route('tax-report-runs.index'));

    $this->assertSoftDeleted($vatRun);
});

test('existing payroll and billing flows derive statutory source records', function () {
    taxActingAsRole('HR / Payroll Officer');

    $employee = taxEmployee();

    $this->post(route('payroll-runs.store'), [
        'payroll_run_no' => 'PR-TAX-FEATURE-0001',
        'period_from' => '2026-03-01',
        'period_to' => '2026-03-15',
        'payroll_date' => '2026-03-18',
        'status' => PayrollRunStatus::Processed->value,
        'remarks' => 'Processed payroll for source record sync test.',
        'entries' => [[
            'employee_id' => $employee->getKey(),
            'gross_pay' => 18000,
            'tax_amount' => 1200,
            'sss_amount' => 360,
            'pagibig_amount' => 180,
            'philhealth_amount' => 270,
            'remarks' => 'Semi-monthly payroll line.',
            'deductions' => [],
        ]],
    ])->assertRedirect();

    expect(WithholdingRecord::query()->where('reference_no', 'PR-TAX-FEATURE-0001')->count())->toBe(4);

    $billingUser = taxActingAsRole('Billing / Accounting Staff');
    $customer = Customer::factory()->create([
        'customer_code' => 'CUST-TAX-FEATURE-0001',
        'company_name' => 'Feature Tax Customer',
    ]);

    $this->post(route('invoices.store'), [
        'invoice_no' => 'INV-TAX-FEATURE-0001',
        'quotation_id' => null,
        'customer_id' => $customer->getKey(),
        'project_id' => null,
        'work_order_id' => null,
        'invoice_date' => '2026-04-12',
        'due_date' => '2026-05-12',
        'tax_amount' => 180,
        'status' => InvoiceStatus::Issued->value,
        'remarks' => 'Invoice for VAT source sync test.',
        'items' => [
            [
                'description' => 'Fire protection maintenance billing',
                'unit' => 'lot',
                'quantity' => 1,
                'unit_price' => 1000,
                'remarks' => null,
            ],
            [
                'description' => 'Replacement materials',
                'unit' => 'lot',
                'quantity' => 1,
                'unit_price' => 500,
                'remarks' => null,
            ],
        ],
    ])->assertRedirect();

    $invoice = Invoice::query()->where('invoice_no', 'INV-TAX-FEATURE-0001')->firstOrFail();
    $vatRecord = VatRecord::query()->where('reference_no', 'INV-TAX-FEATURE-0001')->firstOrFail();

    expect($invoice->status)->toBe(InvoiceStatus::Issued);
    expect($vatRecord->source_id)->toBe($invoice->getKey());
    expect((float) $vatRecord->net_amount)->toBe(1500.0);
    expect((float) $vatRecord->vat_amount)->toBe(180.0);
    expect((float) $vatRecord->gross_amount)->toBe(1680.0);
});

test('tax report run validation and authorization are enforced', function () {
    taxActingAsRole('Billing / Accounting Staff');

    $this->from(route('tax-report-runs.create'))
        ->post(route('tax-report-runs.store'), [
            'report_type' => TaxReportType::Form1601C->value,
            'period_from' => '2026-04-30',
            'period_to' => '2026-04-01',
            'remarks' => str_repeat('a', 2101),
        ])
        ->assertRedirect(route('tax-report-runs.create'))
        ->assertSessionHasErrors(['period_to', 'remarks']);

    expect(TaxReportRun::query()->count())->toBe(0);

    $this->actingAs(User::factory()->create());

    $this->get(route('withholding-records.index'))->assertForbidden();
    $this->get(route('vat-records.index'))->assertForbidden();
    $this->get(route('tax-report-runs.index'))->assertForbidden();
    $this->post(route('tax-report-runs.store'), [
        'report_type' => TaxReportType::Form1601C->value,
        'period_from' => '2026-03-01',
        'period_to' => '2026-03-31',
        'remarks' => 'Unauthorized attempt',
    ])->assertForbidden();
});
