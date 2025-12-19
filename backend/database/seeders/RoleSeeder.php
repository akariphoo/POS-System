<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $roles = [
            [
                'name' => 'Super Admin',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Admin',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Cashier',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Manager',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('roles')->insert($roles);
    }
}
