<?php

use App\Enums\ProjectStatus;
use App\Enums\QuotationStatus;
use App\Enums\WorkOrderStatus;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\Role;
use App\Models\User;
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
        'operations@example.com',
        'coordinator@example.com',
        'warehouse@example.com',
        'billing@example.com',
        'ceo@example.com',
    ])->count())->toBe(7);

    expect(Customer::query()->whereIn('customer_code', [
        'CUST-10001',
        'CUST-10002',
        'CUST-10003',
        'CUST-10004',
        'CUST-10005',
    ])->count())->toBe(5);

    expect(CustomerSite::query()->whereIn('site_code', [
        'SITE-10001',
        'SITE-10002',
        'SITE-10003',
        'SITE-10004',
        'SITE-10005',
        'SITE-10006',
        'SITE-10007',
    ])->count())->toBe(7);

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
});
