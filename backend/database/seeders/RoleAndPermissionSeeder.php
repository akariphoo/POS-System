<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class RoleAndPermissionSeeder extends Seeder
{
    public function run()
    {
        // Clear caches to ensure fresh data
        Cache::forget('roles_list');
        Cache::forget('permissions_list');
        Cache::forget('role_permission_init');

        // 1. Define ALL possible permissions from your Sidebar
        $modules = [
            'dashboard'        => ['view'],
            'branches'         => ['view', 'create', 'edit', 'delete'],
            'users'            => ['view', 'create', 'edit', 'delete'],
            'role_permission'  => ['view', 'manage'],
            'customers'        => ['view', 'create', 'edit', 'delete'],
            'currency'         => ['view', 'manage'],
            'capital'          => ['view', 'manage'],
            'expense_category' => ['view', 'create', 'edit', 'delete'],
            'expense'          => ['view', 'create', 'edit', 'delete'],
            'tax'              => ['view', 'manage'],
            'exchange_rate'    => ['view', 'manage', 'history'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                Permission::updateOrCreate(
                    ['code' => "$module.$action"],
                    [
                        'name' => ucfirst($action) . " " . ucfirst(str_replace('_', ' ', $module)),
                        'module' => $module
                    ]
                );
            }
        }

        // 2. Define Roles
        $adminRole   = Role::updateOrCreate(['name' => 'Admin']);
        $managerRole = Role::updateOrCreate(['name' => 'Manager']);
        $cashierRole = Role::updateOrCreate(['name' => 'Cashier']);

        // 3. Assign Permissions

        // ADMIN: Everything
        $allPermissionIds = Permission::pluck('id');
        $adminRole->permissions()->sync($allPermissionIds);

        // MANAGER: Everything except critical system/user management
        $managerPermissionIds = Permission::whereNotIn('module', ['role_permission'])
            ->whereNotIn('code', ['users.delete', 'branches.delete'])
            ->pluck('id');
        $managerRole->permissions()->sync($managerPermissionIds);

        // CASHIER: Only daily operations (Dashboard, Customers, and viewing Expenses)
        $cashierPermissionCodes = [
            'dashboard.view',
            'customers.view',
            'customers.create',
            'expense.view',
            'exchange_rate.view'
        ];
        $cashierPermissionIds = Permission::whereIn('code', $cashierPermissionCodes)->pluck('id');
        $cashierRole->permissions()->sync($cashierPermissionIds);

        $this->command->info('Roles and Permissions seeded successfully!');
    }
}
