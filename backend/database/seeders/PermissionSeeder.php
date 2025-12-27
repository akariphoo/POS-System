<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            // User Management
            ['module' => 'User Management', 'name' => 'View Users', 'code' => 'user.view'],
            ['module' => 'User Management', 'name' => 'Create User', 'code' => 'user.create'],
            ['module' => 'User Management', 'name' => 'Edit User', 'code' => 'user.edit'],
            ['module' => 'User Management', 'name' => 'Delete User', 'code' => 'user.delete'],

            // Product Management
            ['module' => 'Products', 'name' => 'View Products', 'code' => 'product.view'],
            ['module' => 'Products', 'name' => 'Add Product', 'code' => 'product.create'],
            ['module' => 'Products', 'name' => 'Edit Product', 'code' => 'product.edit'],
            ['module' => 'Products', 'name' => 'Delete Product', 'code' => 'product.delete'],

            // Sales / POS
            ['module' => 'POS', 'name' => 'Make Sale', 'code' => 'sale.create'],
            ['module' => 'POS', 'name' => 'View All Sales', 'code' => 'sale.view_all'],
            ['module' => 'POS', 'name' => 'Void/Refund Sale', 'code' => 'sale.void'],

            // Reports
            ['module' => 'Reports', 'name' => 'View Daily Reports', 'code' => 'report.daily'],
            ['module' => 'Reports', 'name' => 'View Profit Reports', 'code' => 'report.profit'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['code' => $permission['code']], $permission);
        }
    }
}
