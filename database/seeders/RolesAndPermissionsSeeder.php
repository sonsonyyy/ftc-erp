<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'Super Admin',
            'Sales Admin / Business Development',
            'Operations Admin',
            'Project Coordinator',
            'Warehouse / Inventory Officer',
            'Purchasing Officer',
            'Billing / Accounting Staff',
            'HR / Payroll Officer',
            'Compliance Officer / Corporate Admin',
            'Management / CEO',
        ];

        $permissions = [
            ['name' => 'dashboard.view', 'group' => 'dashboard'],
            ['name' => 'users.view', 'group' => 'users'],
            ['name' => 'users.create', 'group' => 'users'],
            ['name' => 'users.update', 'group' => 'users'],
            ['name' => 'users.delete', 'group' => 'users'],
            ['name' => 'customers.view', 'group' => 'customers'],
            ['name' => 'customers.create', 'group' => 'customers'],
            ['name' => 'customers.update', 'group' => 'customers'],
            ['name' => 'customers.delete', 'group' => 'customers'],
            ['name' => 'sites.view', 'group' => 'sites'],
            ['name' => 'sites.create', 'group' => 'sites'],
            ['name' => 'sites.update', 'group' => 'sites'],
            ['name' => 'sites.delete', 'group' => 'sites'],
            ['name' => 'quotations.view', 'group' => 'quotations'],
            ['name' => 'quotations.create', 'group' => 'quotations'],
            ['name' => 'quotations.update', 'group' => 'quotations'],
            ['name' => 'quotations.delete', 'group' => 'quotations'],
            ['name' => 'quotations.change_status', 'group' => 'quotations'],
            ['name' => 'projects.view', 'group' => 'projects'],
            ['name' => 'projects.create', 'group' => 'projects'],
            ['name' => 'projects.update', 'group' => 'projects'],
            ['name' => 'projects.delete', 'group' => 'projects'],
            ['name' => 'projects.change_status', 'group' => 'projects'],
            ['name' => 'work_orders.view', 'group' => 'work_orders'],
            ['name' => 'work_orders.create', 'group' => 'work_orders'],
            ['name' => 'work_orders.update', 'group' => 'work_orders'],
            ['name' => 'work_orders.delete', 'group' => 'work_orders'],
            ['name' => 'work_orders.change_status', 'group' => 'work_orders'],
            ['name' => 'inventory.view', 'group' => 'inventory'],
            ['name' => 'inventory.create', 'group' => 'inventory'],
            ['name' => 'inventory.update', 'group' => 'inventory'],
            ['name' => 'inventory.delete', 'group' => 'inventory'],
            ['name' => 'warehouses.view', 'group' => 'warehouses'],
            ['name' => 'warehouses.create', 'group' => 'warehouses'],
            ['name' => 'warehouses.update', 'group' => 'warehouses'],
            ['name' => 'warehouses.delete', 'group' => 'warehouses'],
            ['name' => 'stock.view', 'group' => 'stock'],
            ['name' => 'stock.adjust', 'group' => 'stock'],
            ['name' => 'stock.issue', 'group' => 'stock'],
            ['name' => 'stock.return', 'group' => 'stock'],
            ['name' => 'attachments.view', 'group' => 'attachments'],
            ['name' => 'attachments.create', 'group' => 'attachments'],
            ['name' => 'attachments.delete', 'group' => 'attachments'],
        ];

        foreach ($roles as $roleName) {
            Role::query()->updateOrCreate(
                ['name' => $roleName],
                ['description' => "{$roleName} role"],
            );
        }

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['name' => $permission['name']],
                ['group' => $permission['group']],
            );
        }

        $permissionAssignments = [
            'Super Admin' => Permission::query()->pluck('id')->all(),
            'Sales Admin / Business Development' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'customers.create',
                    'customers.update',
                    'customers.delete',
                    'sites.view',
                    'sites.create',
                    'sites.update',
                    'sites.delete',
                    'quotations.view',
                    'quotations.create',
                    'quotations.update',
                    'quotations.delete',
                    'quotations.change_status',
                    'projects.view',
                    'projects.create',
                    'projects.update',
                    'projects.delete',
                    'projects.change_status',
                    'work_orders.view',
                    'work_orders.create',
                    'work_orders.update',
                    'work_orders.delete',
                    'work_orders.change_status',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'attachments.view',
                    'attachments.create',
                    'attachments.delete',
                ])->pluck('id')->all(),
            'Operations Admin' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'customers.create',
                    'customers.update',
                    'sites.view',
                    'sites.create',
                    'sites.update',
                    'sites.delete',
                    'quotations.view',
                    'projects.view',
                    'projects.create',
                    'projects.update',
                    'projects.delete',
                    'projects.change_status',
                    'work_orders.view',
                    'work_orders.create',
                    'work_orders.update',
                    'work_orders.delete',
                    'work_orders.change_status',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'stock.issue',
                    'stock.return',
                    'attachments.view',
                    'attachments.create',
                    'attachments.delete',
                ])->pluck('id')->all(),
            'Project Coordinator' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'sites.view',
                    'sites.create',
                    'sites.update',
                    'quotations.view',
                    'projects.view',
                    'projects.create',
                    'projects.update',
                    'projects.change_status',
                    'work_orders.view',
                    'work_orders.create',
                    'work_orders.update',
                    'work_orders.change_status',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'attachments.view',
                    'attachments.create',
                    'attachments.delete',
                ])->pluck('id')->all(),
            'Warehouse / Inventory Officer' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'sites.view',
                    'quotations.view',
                    'projects.view',
                    'work_orders.view',
                    'inventory.view',
                    'inventory.create',
                    'inventory.update',
                    'inventory.delete',
                    'warehouses.view',
                    'warehouses.create',
                    'warehouses.update',
                    'warehouses.delete',
                    'stock.view',
                    'stock.adjust',
                    'stock.issue',
                    'stock.return',
                    'attachments.view',
                ])->pluck('id')->all(),
            'Purchasing Officer' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'sites.view',
                    'quotations.view',
                    'projects.view',
                    'work_orders.view',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'attachments.view',
                ])->pluck('id')->all(),
            'Billing / Accounting Staff' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'sites.view',
                    'quotations.view',
                    'projects.view',
                    'work_orders.view',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'attachments.view',
                ])->pluck('id')->all(),
            'HR / Payroll Officer' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                ])->pluck('id')->all(),
            'Compliance Officer / Corporate Admin' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'sites.view',
                    'quotations.view',
                    'projects.view',
                    'work_orders.view',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'attachments.view',
                ])->pluck('id')->all(),
            'Management / CEO' => Permission::query()
                ->whereIn('name', [
                    'dashboard.view',
                    'customers.view',
                    'sites.view',
                    'quotations.view',
                    'projects.view',
                    'work_orders.view',
                    'inventory.view',
                    'warehouses.view',
                    'stock.view',
                    'attachments.view',
                ])->pluck('id')->all(),
        ];

        foreach ($permissionAssignments as $roleName => $permissionIds) {
            $role = Role::query()->where('name', $roleName)->firstOrFail();
            $role->permissions()->sync($permissionIds);
        }
    }
}
