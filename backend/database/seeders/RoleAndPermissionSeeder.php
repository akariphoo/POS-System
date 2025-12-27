<?php
namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run()
    {
        // 1. Create or Update Roles
        $admin = Role::updateOrCreate(['name' => 'Admin']);
        $manager = Role::updateOrCreate(['name' => 'Manager']);
        $cashier = Role::updateOrCreate(['name' => 'Cashier']);

        // 2. Assign ALL permissions to Admin
        $allPermissions = Permission::all();
        $admin->permissions()->sync($allPermissions->pluck('id'));

        // 3. Define Manager Permissions (Everything except User Deletion/System Settings)
        $managerPermissions = Permission::whereNotIn('code', [
            'user.delete',
            'user.create'
        ])->pluck('id');
        $manager->permissions()->sync($managerPermissions);

        // 4. Define Cashier Permissions (Restricted to daily operations)
        $cashierPermissionCodes = [
            'product.view',
            'sale.create',
            'report.daily' // Limited reporting
        ];
        $cashierPermissions = Permission::whereIn('code', $cashierPermissionCodes)->get();
        $cashier->permissions()->sync($cashierPermissions->pluck('id'));
    }
}
