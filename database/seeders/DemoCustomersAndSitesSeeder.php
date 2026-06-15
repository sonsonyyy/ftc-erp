<?php

namespace Database\Seeders;

use App\Actions\Documents\GenerateDocumentNumberAction;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use RuntimeException;

class DemoCustomersAndSitesSeeder extends Seeder
{
    private const CUSTOMER_NAMES = [
        'metrobuild' => 'MetroBuild Fire & Construction, Inc.',
        'harbor_view' => 'Harbor View Properties, Inc.',
        'san_isidro_medical' => 'San Isidro Medical Center',
        'northpoint_foods' => 'Northpoint Industrial Foods Corporation',
        'blue_horizon' => 'Blue Horizon Hospitality Group',
    ];

    private const SITE_NAMES = [
        'metrobuild_makati_corporate_center' => 'Makati Corporate Center',
        'metrobuild_laguna_fabrication_yard' => 'Laguna Fabrication Yard',
        'harbor_view_pasig_east_tower' => 'Pasig East Tower',
        'san_isidro_main_hospital_campus' => 'Main Hospital Campus',
        'san_isidro_annex_diagnostic_wing' => 'Annex Diagnostic Wing',
        'northpoint_bulacan_cold_storage_plant' => 'Bulacan Cold Storage Plant',
        'blue_horizon_bgc_boutique_hotel' => 'BGC Boutique Hotel',
    ];

    /**
     * Run the database seeds.
     */
    public function run(GenerateDocumentNumberAction $generateDocumentNumberAction): void
    {
        $customers = [
            'metrobuild' => [
                'company_name' => 'MetroBuild Fire & Construction, Inc.',
                'trade_name' => 'MetroBuild',
                'tin' => '000-111-222-333',
                'phone' => '+63 2 8812 4100',
                'email' => 'admin@metrobuild.example.com',
                'billing_address' => '18F MetroBuild Tower, Ayala Avenue, Makati City',
                'notes' => 'Handles commercial fit-outs and retrofit packages.',
                'sites' => [
                    'metrobuild_makati_corporate_center' => [
                        'site_name' => 'Makati Corporate Center',
                        'contact_person' => 'John Villanueva',
                        'contact_no' => '+63 917 810 1001',
                        'email' => 'facilities@metrobuild.example.com',
                        'address' => '7258 Ayala Avenue, Makati City',
                        'city' => 'Makati City',
                        'province' => 'Metro Manila',
                        'notes' => 'Primary commercial retrofit site.',
                        'is_active' => true,
                    ],
                    'metrobuild_laguna_fabrication_yard' => [
                        'site_name' => 'Laguna Fabrication Yard',
                        'contact_person' => 'Ruel Pascual',
                        'contact_no' => '+63 917 810 1002',
                        'email' => 'yard@metrobuild.example.com',
                        'address' => 'Block 12, Greenfield Industrial Park, Binan, Laguna',
                        'city' => 'Binan',
                        'province' => 'Laguna',
                        'notes' => 'Fabrication and staging yard.',
                        'is_active' => true,
                    ],
                ],
            ],
            'harbor_view' => [
                'company_name' => 'Harbor View Properties, Inc.',
                'trade_name' => 'Harbor View',
                'tin' => '000-111-222-444',
                'phone' => '+63 2 8824 5100',
                'email' => 'engineering@harborview.example.com',
                'billing_address' => '9F Harbor View Center, Julia Vargas Avenue, Pasig City',
                'notes' => 'Mixed-use property developer with recurring service requests.',
                'sites' => [
                    'harbor_view_pasig_east_tower' => [
                        'site_name' => 'Pasig East Tower',
                        'contact_person' => 'Mara Co',
                        'contact_no' => '+63 917 810 1003',
                        'email' => 'easttower@harborview.example.com',
                        'address' => 'Exchange Road corner Meralco Avenue, Pasig City',
                        'city' => 'Pasig City',
                        'province' => 'Metro Manila',
                        'notes' => 'Condominium tower with basement pump room scope.',
                        'is_active' => true,
                    ],
                ],
            ],
            'san_isidro_medical' => [
                'company_name' => 'San Isidro Medical Center',
                'trade_name' => 'San Isidro Med',
                'tin' => '000-111-222-555',
                'phone' => '+63 2 8861 7000',
                'email' => 'facilities@sanisidro.example.com',
                'billing_address' => '45 San Isidro Avenue, Quezon City',
                'notes' => 'Hospital client with preventive maintenance and compliance work.',
                'sites' => [
                    'san_isidro_main_hospital_campus' => [
                        'site_name' => 'Main Hospital Campus',
                        'contact_person' => 'Dr. Liza Moreno',
                        'contact_no' => '+63 917 810 1004',
                        'email' => 'maincampus@sanisidro.example.com',
                        'address' => '45 San Isidro Avenue, Quezon City',
                        'city' => 'Quezon City',
                        'province' => 'Metro Manila',
                        'notes' => 'Main campus with occupied clinical areas.',
                        'is_active' => true,
                    ],
                    'san_isidro_annex_diagnostic_wing' => [
                        'site_name' => 'Annex Diagnostic Wing',
                        'contact_person' => 'Gerald Flores',
                        'contact_no' => '+63 917 810 1005',
                        'email' => 'annex@sanisidro.example.com',
                        'address' => '52 San Isidro Avenue, Quezon City',
                        'city' => 'Quezon City',
                        'province' => 'Metro Manila',
                        'notes' => 'Specialized diagnostic wing and data room.',
                        'is_active' => true,
                    ],
                ],
            ],
            'northpoint_foods' => [
                'company_name' => 'Northpoint Industrial Foods Corporation',
                'trade_name' => 'Northpoint Foods',
                'tin' => '000-111-222-666',
                'phone' => '+63 44 794 2200',
                'email' => 'plant.admin@northpoint.example.com',
                'billing_address' => 'Northpoint Industrial Estate, Bocaue, Bulacan',
                'notes' => 'Industrial processing plant with warehouse fire protection requirements.',
                'sites' => [
                    'northpoint_bulacan_cold_storage_plant' => [
                        'site_name' => 'Bulacan Cold Storage Plant',
                        'contact_person' => 'Henry Dizon',
                        'contact_no' => '+63 917 810 1006',
                        'email' => 'coldstorage@northpoint.example.com',
                        'address' => 'Warehouse 4, Northpoint Industrial Estate, Bocaue, Bulacan',
                        'city' => 'Bocaue',
                        'province' => 'Bulacan',
                        'notes' => 'Cold storage warehouse and production line.',
                        'is_active' => true,
                    ],
                ],
            ],
            'blue_horizon' => [
                'company_name' => 'Blue Horizon Hospitality Group',
                'trade_name' => 'Blue Horizon',
                'tin' => '000-111-222-777',
                'phone' => '+63 2 8853 6000',
                'email' => 'projects@bluehorizon.example.com',
                'billing_address' => '7F Horizon House, Bonifacio Global City, Taguig City',
                'notes' => 'Hospitality account retained for historical jobs and future follow-ups.',
                'sites' => [
                    'blue_horizon_bgc_boutique_hotel' => [
                        'site_name' => 'BGC Boutique Hotel',
                        'contact_person' => 'Nico Perez',
                        'contact_no' => '+63 917 810 1007',
                        'email' => 'hotel.ops@bluehorizon.example.com',
                        'address' => '38th Street corner 7th Avenue, Taguig City',
                        'city' => 'Taguig City',
                        'province' => 'Metro Manila',
                        'notes' => 'Dormant hospitality account.',
                        'is_active' => false,
                    ],
                ],
            ],
        ];

        $salesUserId = $this->salesOwnerId();

        Carbon::withTestNow('2026-06-01 09:00:00', function () use (
            $customers,
            $generateDocumentNumberAction,
            $salesUserId,
        ): void {
            foreach ($customers as $customerAlias => $demoCustomer) {
                $customer = Customer::query()->firstOrNew([
                    'company_name' => $demoCustomer['company_name'],
                ]);

                if (! $customer->exists) {
                    $customer->customer_code = $generateDocumentNumberAction->forCustomer();
                }

                $customer->fill([
                    'created_by' => $salesUserId,
                    'company_name' => $demoCustomer['company_name'],
                    'trade_name' => $demoCustomer['trade_name'],
                    'tin' => $demoCustomer['tin'],
                    'phone' => $demoCustomer['phone'],
                    'email' => $demoCustomer['email'],
                    'billing_address' => $demoCustomer['billing_address'],
                    'notes' => $demoCustomer['notes'],
                ]);
                $customer->save();

                foreach ($demoCustomer['sites'] as $siteAlias => $demoSite) {
                    $site = CustomerSite::query()->firstOrNew([
                        'customer_id' => $customer->getKey(),
                        'site_name' => $demoSite['site_name'],
                    ]);

                    if (! $site->exists) {
                        $site->site_code = $generateDocumentNumberAction->forSite();
                    }

                    $site->fill([
                        'customer_id' => $customer->getKey(),
                        'site_name' => $demoSite['site_name'],
                        'contact_person' => $demoSite['contact_person'],
                        'contact_no' => $demoSite['contact_no'],
                        'email' => $demoSite['email'],
                        'address' => $demoSite['address'],
                        'city' => $demoSite['city'],
                        'province' => $demoSite['province'],
                        'notes' => $demoSite['notes'],
                        'is_active' => $demoSite['is_active'],
                    ]);
                    $site->save();
                }
            }
        });
    }

    public static function customerId(string $alias): int
    {
        $customerId = Customer::query()
            ->where('company_name', self::customerName($alias))
            ->value('id');

        if ($customerId === null) {
            throw new RuntimeException("Customer alias [{$alias}] was not found while resolving demo references.");
        }

        return (int) $customerId;
    }

    public static function siteId(string $alias): int
    {
        $siteId = CustomerSite::query()
            ->where('site_name', self::siteName($alias))
            ->value('id');

        if ($siteId === null) {
            throw new RuntimeException("Site alias [{$alias}] was not found while resolving demo references.");
        }

        return (int) $siteId;
    }

    public static function customerName(string $alias): string
    {
        return self::CUSTOMER_NAMES[$alias]
            ?? throw new RuntimeException("Unknown demo customer alias [{$alias}].");
    }

    public static function siteName(string $alias): string
    {
        return self::SITE_NAMES[$alias]
            ?? throw new RuntimeException("Unknown demo site alias [{$alias}].");
    }

    private function salesOwnerId(): int
    {
        $userId = User::query()
            ->where('email', 'sales@example.com')
            ->value('id');

        if ($userId === null) {
            throw new RuntimeException('Demo sales user [sales@example.com] was not found while seeding customers.');
        }

        return (int) $userId;
    }
}
