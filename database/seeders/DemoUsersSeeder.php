<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@example.com',
                'is_active' => true,
                'roles' => [Role::SUPER_ADMIN],
            ],
            [
                'name' => 'Sofia Reyes',
                'email' => 'sales@example.com',
                'is_active' => true,
                'roles' => ['Sales Admin / Business Development'],
            ],
            [
                'name' => 'Paolo Mendoza',
                'email' => 'sales.coordinator@example.com',
                'is_active' => true,
                'roles' => ['Sales Admin / Business Development'],
            ],
            [
                'name' => 'Andrea Ramos',
                'email' => 'operations@example.com',
                'is_active' => true,
                'roles' => ['Operations Admin'],
            ],
            [
                'name' => 'Miguel Santos',
                'email' => 'coordinator@example.com',
                'is_active' => true,
                'roles' => ['Project Coordinator'],
            ],
            [
                'name' => 'Carla Gomez',
                'email' => 'warehouse@example.com',
                'is_active' => true,
                'roles' => ['Warehouse / Inventory Officer'],
            ],
            [
                'name' => 'Bea Navarro',
                'email' => 'billing@example.com',
                'is_active' => true,
                'roles' => ['Billing / Accounting Staff'],
            ],
            [
                'name' => 'David Tan',
                'email' => 'compliance@example.com',
                'is_active' => true,
                'roles' => ['Compliance Officer / Corporate Admin'],
            ],
            [
                'name' => 'Isabelle Lim',
                'email' => 'ceo@example.com',
                'is_active' => true,
                'roles' => ['Management / CEO'],
            ],
            [
                'name' => 'Nina Garcia',
                'email' => 'inactive.hr@example.com',
                'is_active' => false,
                'roles' => ['HR / Payroll Officer'],
            ],
        ];

        foreach ($users as $demoUser) {
            $user = User::query()->firstOrNew([
                'email' => $demoUser['email'],
            ]);

            $user->fill([
                'name' => $demoUser['name'],
                'email' => $demoUser['email'],
                'password' => 'password',
                'email_verified_at' => now(),
                'is_active' => $demoUser['is_active'],
            ]);
            $user->save();

            $user->roles()->sync($this->resolveRoleIds($demoUser['roles']));
        }
    }

    /**
     * Resolve the given role names to database identifiers.
     *
     * @param  array<int, string>  $roleNames
     * @return array<int, int>
     */
    private function resolveRoleIds(array $roleNames): array
    {
        $roleIds = Role::query()
            ->whereIn('name', $roleNames)
            ->pluck('id', 'name');

        return collect($roleNames)
            ->map(function (string $roleName) use ($roleIds): int {
                $roleId = $roleIds->get($roleName);

                if ($roleId === null) {
                    throw new RuntimeException("Role [{$roleName}] was not found while seeding demo users.");
                }

                return (int) $roleId;
            })
            ->all();
    }
}
