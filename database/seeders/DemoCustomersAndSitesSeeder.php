<?php

namespace Database\Seeders;

use App\Enums\CustomerStatus;
use App\Models\Customer;
use App\Models\CustomerSite;
use Illuminate\Database\Seeder;

class DemoCustomersAndSitesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'customer_code' => 'CUST-10001',
                'company_name' => 'MetroBuild Fire & Construction, Inc.',
                'trade_name' => 'MetroBuild',
                'tin' => '000-111-222-333',
                'phone' => '+63 2 8812 4100',
                'email' => 'admin@metrobuild.example.com',
                'billing_address' => '18F MetroBuild Tower, Ayala Avenue, Makati City',
                'status' => CustomerStatus::Active->value,
                'notes' => 'Handles commercial fit-outs and retrofit packages.',
                'sites' => [
                    [
                        'site_code' => 'SITE-10001',
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
                    [
                        'site_code' => 'SITE-10002',
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
            [
                'customer_code' => 'CUST-10002',
                'company_name' => 'Harbor View Properties, Inc.',
                'trade_name' => 'Harbor View',
                'tin' => '000-111-222-444',
                'phone' => '+63 2 8824 5100',
                'email' => 'engineering@harborview.example.com',
                'billing_address' => '9F Harbor View Center, Julia Vargas Avenue, Pasig City',
                'status' => CustomerStatus::Active->value,
                'notes' => 'Mixed-use property developer with recurring service requests.',
                'sites' => [
                    [
                        'site_code' => 'SITE-10003',
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
            [
                'customer_code' => 'CUST-10003',
                'company_name' => 'San Isidro Medical Center',
                'trade_name' => 'San Isidro Med',
                'tin' => '000-111-222-555',
                'phone' => '+63 2 8861 7000',
                'email' => 'facilities@sanisidro.example.com',
                'billing_address' => '45 San Isidro Avenue, Quezon City',
                'status' => CustomerStatus::Active->value,
                'notes' => 'Hospital client with preventive maintenance and compliance work.',
                'sites' => [
                    [
                        'site_code' => 'SITE-10004',
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
                    [
                        'site_code' => 'SITE-10005',
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
            [
                'customer_code' => 'CUST-10004',
                'company_name' => 'Northpoint Industrial Foods Corporation',
                'trade_name' => 'Northpoint Foods',
                'tin' => '000-111-222-666',
                'phone' => '+63 44 794 2200',
                'email' => 'plant.admin@northpoint.example.com',
                'billing_address' => 'Northpoint Industrial Estate, Bocaue, Bulacan',
                'status' => CustomerStatus::Active->value,
                'notes' => 'Industrial processing plant with warehouse fire protection requirements.',
                'sites' => [
                    [
                        'site_code' => 'SITE-10006',
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
            [
                'customer_code' => 'CUST-10005',
                'company_name' => 'Blue Horizon Hospitality Group',
                'trade_name' => 'Blue Horizon',
                'tin' => '000-111-222-777',
                'phone' => '+63 2 8853 6000',
                'email' => 'projects@bluehorizon.example.com',
                'billing_address' => '7F Horizon House, Bonifacio Global City, Taguig City',
                'status' => CustomerStatus::Inactive->value,
                'notes' => 'Inactive account retained for historical records and reference.',
                'sites' => [
                    [
                        'site_code' => 'SITE-10007',
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

        foreach ($customers as $demoCustomer) {
            $customer = Customer::query()->updateOrCreate(
                ['customer_code' => $demoCustomer['customer_code']],
                [
                    'company_name' => $demoCustomer['company_name'],
                    'trade_name' => $demoCustomer['trade_name'],
                    'tin' => $demoCustomer['tin'],
                    'phone' => $demoCustomer['phone'],
                    'email' => $demoCustomer['email'],
                    'billing_address' => $demoCustomer['billing_address'],
                    'status' => $demoCustomer['status'],
                    'notes' => $demoCustomer['notes'],
                ],
            );

            foreach ($demoCustomer['sites'] as $demoSite) {
                CustomerSite::query()->updateOrCreate(
                    ['site_code' => $demoSite['site_code']],
                    [
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
                    ],
                );
            }
        }
    }
}
