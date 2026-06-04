<?php

use App\Enums\QuotationStatus;
use App\Models\Customer;
use App\Models\Quotation;
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

function actingAsQuotationKpiRole(string $roleName): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('name', $roleName)->firstOrFail();

    $user->roles()->sync([$role->getKey()]);

    test()->actingAs($user);

    return $user;
}

test('authorized users can view the quotation kpi dashboard', function () {
    actingAsQuotationKpiRole('Management / CEO');

    $alphaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-ALPHA',
        'company_name' => 'Alpha Fire Systems',
    ]);

    $betaCustomer = Customer::factory()->create([
        'customer_code' => 'CUST-BETA',
        'company_name' => 'Beta Safety Corp',
    ]);

    Quotation::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'quotation_no' => 'QTN-AWD-001',
        'quotation_date' => '2026-04-01',
        'quotation_amount' => 1000,
        'status' => QuotationStatus::Awarded,
        'materialized_at' => '2026-04-06',
    ]);

    Quotation::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'quotation_no' => 'QTN-SUB-001',
        'quotation_date' => '2026-04-03',
        'quotation_amount' => 2000,
        'status' => QuotationStatus::Submitted,
    ]);

    Quotation::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'quotation_no' => 'QTN-LST-001',
        'quotation_date' => '2026-04-05',
        'quotation_amount' => 2500,
        'status' => QuotationStatus::Lost,
        'lost_reason' => 'Client budget constraints',
    ]);

    Quotation::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'quotation_no' => 'QTN-DRF-001',
        'quotation_date' => '2026-04-07',
        'quotation_amount' => 700,
        'status' => QuotationStatus::Draft,
    ]);

    $this->get(route('quotations.kpi', [
        'range' => 'custom',
        'from' => '2026-04-01',
        'to' => '2026-04-30',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('quotations/kpi')
            ->where('filters.range', 'custom')
            ->where('metrics.total_submitted', 3)
            ->where('metrics.total_awarded', 1)
            ->where('metrics.pending_count', 1)
            ->where('metrics.lost_count', 1)
            ->where('metrics.total_quotation_value', 5500)
            ->where('metrics.awarded_value', 1000)
            ->where('metrics.average_days_to_materialize', 5)
            ->where('topCustomersByAwardedValue.0.customer.company_name', 'Alpha Fire Systems')
            ->where('lostReasons.0.lost_reason', 'Client budget constraints'),
        );
});

test('quotation kpi dashboard can be filtered by customer', function () {
    actingAsQuotationKpiRole('Management / CEO');

    $alphaCustomer = Customer::factory()->create([
        'company_name' => 'Alpha Fire Systems',
    ]);

    $betaCustomer = Customer::factory()->create([
        'company_name' => 'Beta Safety Corp',
    ]);

    Quotation::factory()->create([
        'customer_id' => $alphaCustomer->getKey(),
        'quotation_amount' => 4000,
        'status' => QuotationStatus::Submitted,
        'quotation_date' => '2026-04-02',
    ]);

    Quotation::factory()->create([
        'customer_id' => $betaCustomer->getKey(),
        'quotation_amount' => 9000,
        'status' => QuotationStatus::Awarded,
        'quotation_date' => '2026-04-03',
        'materialized_at' => '2026-04-08',
    ]);

    $this->get(route('quotations.kpi', [
        'range' => 'custom',
        'from' => '2026-04-01',
        'to' => '2026-04-30',
        'customer' => $alphaCustomer->getKey(),
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('quotations/kpi')
            ->where('filters.customer', $alphaCustomer->getKey())
            ->where('metrics.total_submitted', 1)
            ->where('metrics.total_awarded', 0)
            ->where('metrics.total_quotation_value', 4000)
            ->where('topCustomersByQuotationValue.0.customer.company_name', 'Alpha Fire Systems'),
        );
});

test('quotation kpi dashboard can be filtered by type and custom dates', function () {
    actingAsQuotationKpiRole('Management / CEO');

    $customer = Customer::factory()->create([
        'company_name' => 'Range Filter Customer',
    ]);

    Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'quotation_amount' => 1200,
        'status' => QuotationStatus::Awarded,
        'quotation_date' => '2026-04-10',
        'materialized_at' => '2026-04-15',
    ]);

    Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'quotation_amount' => 1800,
        'status' => QuotationStatus::Awarded,
        'quotation_date' => '2026-05-10',
        'materialized_at' => '2026-05-13',
    ]);

    Quotation::factory()->create([
        'customer_id' => $customer->getKey(),
        'quotation_amount' => 5000,
        'status' => QuotationStatus::Submitted,
        'quotation_date' => '2026-05-12',
    ]);

    $this->get(route('quotations.kpi', [
        'range' => 'custom',
        'from' => '2026-05-01',
        'to' => '2026-05-31',
        'status' => QuotationStatus::Awarded->value,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('quotations/kpi')
            ->where('filters.range', 'custom')
            ->where('filters.status', QuotationStatus::Awarded->value)
            ->where('filters.from', '2026-05-01')
            ->where('filters.to', '2026-05-31')
            ->where('metrics.total_submitted', 1)
            ->where('metrics.total_awarded', 1)
            ->where('metrics.total_quotation_value', 1800)
            ->where('metrics.awarded_value', 1800)
            ->where('metrics.pending_count', 0)
            ->where('metrics.lost_count', 0)
            ->where('statusBreakdown.3.status', QuotationStatus::Awarded->value)
            ->where('statusBreakdown.3.count', 1)
            ->where('topCustomersByAwardedValue.0.total_value', 1800),
        );
});

test('users without permissions cannot view the quotation kpi dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('quotations.kpi'))
        ->assertForbidden();
});
