<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            DemoUsersSeeder::class,
            DemoCustomersAndSitesSeeder::class,
            DemoQuotationsSeeder::class,
            DemoProjectsSeeder::class,
            DemoWorkOrdersSeeder::class,
            DemoInventorySeeder::class,
            DemoPurchasingSeeder::class,
            DemoBillingSeeder::class,
            DemoPayrollSeeder::class,
            DemoTaxStatutorySeeder::class,
        ]);
    }
}
