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
        $superAdminRoleId = DB::table('roles')->where('name', 'Super Admin')->value('id');
        $adminRoleId      = DB::table('roles')->where('name', 'Admin')->value('id');
        $cashierRoleId    = DB::table('roles')->where('name', 'Cashier')->value('id');

        DB::table('users')->insert([
            [
                'username'   => 'superadmin',
                'login_id'   => 'SA001',
                'role_id'    => $superAdminRoleId,
                'phone'      => '0990000001',
                'password'   => Hash::make('password'),
                'remember_token' => null,
                'created_at'=> $now,
                'updated_at'=> $now,
            ],
            [
                'username'   => 'admin',
                'login_id'   => 'AD001',
                'role_id'    => $adminRoleId,
                'phone'      => '0990000002',
                'password'   => Hash::make('password'),
                'remember_token' => null,
                'created_at'=> $now,
                'updated_at'=> $now,
            ],
            [
                'username'   => 'cashier',
                'login_id'   => 'CS001',
                'role_id'    => $cashierRoleId,
                'phone'      => '0990000003',
                'password'   => Hash::make('password'),
                'remember_token' => null,
                'created_at'=> $now,
                'updated_at'=> $now,
            ],
        ]);
    }
}
