<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Get role IDs
        $adminRoleId   = DB::table('roles')->where('name', 'Admin')->value('id');
        $managerRoleId = DB::table('roles')->where('name', 'Manager')->value('id');
        $cashierRoleId = DB::table('roles')->where('name', 'Cashier')->value('id');

        // Get branch IDs (Assuming you ran BranchSeeder first)
        $yangonBranchId   = DB::table('branches')->where('city', 'Yangon')->value('id');
        $mandalayBranchId = DB::table('branches')->where('city', 'Mandalay')->value('id');

        DB::table('users')->insert([
            [
                'name'       => 'admin',
                'login_id'   => 'admin',
                'role_id'    => $adminRoleId,
                'branch_id'  => $yangonBranchId, // Linked to Yangon
                'phone'      => '0990000002',
                'password'   => Hash::make('password'),
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'       => 'Manager',
                'login_id'   => 'manager',
                'role_id'    => $managerRoleId,
                'branch_id'  => $yangonBranchId, // Linked to Yangon
                'phone'      => '0990000001',
                'password'   => Hash::make('password'),
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name'       => 'Cashier',
                'login_id'   => 'cashier',
                'role_id'    => $cashierRoleId,
                'branch_id'  => $mandalayBranchId, // Linked to Mandalay
                'phone'      => '0990000003',
                'password'   => Hash::make('password'),
                'remember_token' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
