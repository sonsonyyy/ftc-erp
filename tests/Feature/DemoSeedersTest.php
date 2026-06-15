<?php

use App\Enums\PayrollRunStatus;
use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\TaxReportType;
use App\Enums\VatRecordType;
use App\Enums\WithholdingRecordType;
use App\Enums\WorkOrderStatus;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\ComplianceSubmission;
use App\Models\ComplianceTask;
use App\Models\ComplianceTemplate;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PayrollDeduction;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use App\Models\Position;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\Role;
use App\Models\TaxReportRun;
use App\Models\User;
use App\Models\VatRecord;
use App\Models\WithholdingRecord;
use App\Models\WorkOrder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('database seeder provisions core ERP demo data', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()
        ->where('email', 'admin@example.com')
        ->firstOrFail();

    expect(Hash::check('password', $admin->password))->toBeTrue();
    expect($admin->roleNames())->toContain(Role::SUPER_ADMIN);

    expect(User::query()->whereIn('email', [
        'admin@example.com',
        'sales@example.com',
        'sales.coordinator@example.com',
        'operations@example.com',
        'coordinator@example.com',
        'warehouse@example.com',
        'purchasing@example.com',
        'hr@example.com',
        'billing@example.com',
        'compliance@example.com',
        'ceo@example.com',
    ])->count())->toBe(11);

    $salesUser = User::query()
        ->where('email', 'sales@example.com')
        ->firstOrFail();

    expect(Customer::query()->count())->toBe(5);
    expect(Customer::query()->where('customer_code', 'like', 'CUST-0626-%')->count())->toBe(5);
    expect(Customer::query()->where('created_by', $salesUser->getKey())->count())->toBe(5);

    expect(CustomerSite::query()->count())->toBe(7);
    expect(CustomerSite::query()->where('site_code', 'like', 'SITE-0626-%')->count())->toBe(7);

    expect(Department::query()->count())->toBe(4);
    expect(Position::query()->count())->toBe(5);
    expect(Employee::query()->count())->toBe(6);
    expect(Employee::query()->where('is_active', false)->count())->toBe(1);

    expect(PayrollRun::query()->count())->toBe(2);
    expect(PayrollRun::query()->where('status', PayrollRunStatus::Processed)->count())->toBe(1);
    expect(PayrollRun::query()->where('status', PayrollRunStatus::Draft)->count())->toBe(1);
    expect(PayrollEntry::query()->count())->toBe(5);
    expect(PayrollDeduction::query()->count())->toBe(3);

    expect(WithholdingRecord::query()->count())->toBe(12);
    expect(WithholdingRecord::query()
        ->where('record_type', WithholdingRecordType::CompensationWithholding)
        ->count())->toBe(3);
    expect(WithholdingRecord::query()
        ->where('record_type', WithholdingRecordType::SssContribution)
        ->count())->toBe(3);
    expect(WithholdingRecord::query()
        ->where('record_type', WithholdingRecordType::PagibigContribution)
        ->count())->toBe(3);
    expect(WithholdingRecord::query()
        ->where('record_type', WithholdingRecordType::PhilhealthContribution)
        ->count())->toBe(3);

    expect(VatRecord::query()->count())->toBe(5);
    expect(VatRecord::query()->where('record_type', VatRecordType::OutputVat)->count())->toBe(5);

    $withholdingReportRun = TaxReportRun::query()
        ->where('report_type', TaxReportType::Form1601C)
        ->firstOrFail();

    expect($withholdingReportRun->item_count)->toBe(3);
    expect($withholdingReportRun->generatedBy?->email)->toBe('hr@example.com');

    $vatSummaryRun = TaxReportRun::query()
        ->where('report_type', TaxReportType::VatSummary)
        ->firstOrFail();

    expect($vatSummaryRun->item_count)->toBe(5);
    expect($vatSummaryRun->generatedBy?->email)->toBe('billing@example.com');

    $awardedQuotation = Quotation::query()
        ->where('quotation_no', 'QTN-2026-0001')
        ->firstOrFail();

    expect($awardedQuotation->status)->toBe(QuotationStatus::Awarded);
    expect($awardedQuotation->statusLogs()->count())->toBe(4);

    $directServiceQuotation = Quotation::query()
        ->where('quotation_no', 'QTN-2026-0006')
        ->firstOrFail();

    expect($directServiceQuotation->status)->toBe(QuotationStatus::Awarded);
    expect($directServiceQuotation->converted_work_order_id)->not->toBeNull();

    $project = Project::query()
        ->where('project_no', 'PRJ-2026-0001')
        ->firstOrFail();

    expect($project->status)->toBe(ProjectStatus::InProgress);
    expect($project->quotation_id)->toBe($awardedQuotation->getKey());
    expect($project->assignments()->count())->toBe(2);
    expect($awardedQuotation->fresh()->converted_project_id)->toBe($project->getKey());

    $directServiceWorkOrder = WorkOrder::query()
        ->where('work_order_no', 'WO-2026-0003')
        ->firstOrFail();

    expect($directServiceWorkOrder->status)->toBe(WorkOrderStatus::Closed);
    expect($directServiceWorkOrder->quotation_id)->toBe($directServiceQuotation->getKey());
    expect($directServiceWorkOrder->project_id)->toBeNull();
    expect($directServiceWorkOrder->materials()->count())->toBe(1);

    $projectWorkOrder = WorkOrder::query()
        ->where('work_order_no', 'WO-2026-0001')
        ->firstOrFail();

    expect($projectWorkOrder->project_id)->toBe($project->getKey());
    expect($projectWorkOrder->assignments()->count())->toBe(2);
    expect($projectWorkOrder->logs()->count())->toBe(4);

    $paidInvoice = Invoice::query()
        ->where('invoice_no', 'INV-2026-0001')
        ->firstOrFail();

    expect((float) $paidInvoice->total_amount)->toBe(120000.0);
    expect((float) $paidInvoice->balance_amount)->toBe(0.0);
    expect($paidInvoice->payments()->count())->toBe(1);

    $partiallyPaidInvoice = Invoice::query()
        ->where('invoice_no', 'INV-2026-0002')
        ->firstOrFail();

    expect((float) $partiallyPaidInvoice->total_amount)->toBe(120000.0);
    expect((float) $partiallyPaidInvoice->balance_amount)->toBe(80000.0);
    expect($partiallyPaidInvoice->payments()->count())->toBe(1);

    expect(Invoice::query()->count())->toBe(5);
    expect(Payment::query()->count())->toBe(2);

    expect(ComplianceTemplate::query()->count())->toBe(6);
    expect(ComplianceRecord::query()->count())->toBe(6);
    expect(ComplianceTask::query()->count())->toBe(3);
    expect(ComplianceSubmission::query()->count())->toBe(2);
    expect(ComplianceAlert::query()->count())->toBe(6);
    expect(ComplianceAlert::query()->whereNull('acknowledged_at')->count())->toBe(5);

    $expiredComplianceRecord = ComplianceRecord::query()
        ->where('record_no', 'CMP-2026-0003')
        ->firstOrFail();

    expect($expiredComplianceRecord->title)->toBe('Business Permit 2026');

    $renewalRecord = ComplianceRecord::query()
        ->where('record_no', 'CMP-2026-0002')
        ->firstOrFail();

    expect($renewalRecord->latest_submission_reference)->toBe('SUB-CMP-0002');
});
