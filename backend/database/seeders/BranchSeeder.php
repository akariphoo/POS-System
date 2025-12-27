<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Default Branch (Main Hub)
        Branch::create([
            'branch_name' => 'Yangon Head Office',
            'city'        => 'Yangon',
            'state'       => 'Yangon Region',
            'address'     => 'No. 123, Pyay Road, Kamayut Township',
            'is_default'  => true,
        ]);

        // 2. Mandalay Branch
        Branch::create([
            'branch_name' => 'Mandalay Branch',
            'city'        => 'Mandalay',
            'state'       => 'Mandalay Region',
            'address'     => '78th Street, Between 30th & 31st St, Chanayethazan',
            'is_default'  => false,
        ]);

        // 3. Naypyidaw Branch
        Branch::create([
            'branch_name' => 'Naypyidaw Express',
            'city'        => 'Naypyidaw',
            'state'       => 'Union Territory',
            'address'     => 'Thiri Mandala Ward, Zabuthiri Township',
            'is_default'  => false,
        ]);

        // 4. Taunggyi Branch
        Branch::create([
            'branch_name' => 'Shan State Outlet',
            'city'        => 'Taunggyi',
            'state'       => 'Shan State',
            'address'     => 'Bogyoke Aung San Road, Near Myoma Market',
            'is_default'  => false,
        ]);
    }
}
