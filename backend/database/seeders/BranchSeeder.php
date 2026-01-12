<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Primary Brand (Main Hub)
        Branch::create([
            'branch_name' => 'K&A Medi-Care',
            'city'         => 'Yangon',
            'state'        => 'Yangon Region',
            'address'      => 'No. 123, Pyay Road, Kamayut Township',
            'is_default'   => true,
        ]);

        // 2. Mandalay Branch - Royal Theme
        Branch::create([
            'branch_name' => 'K&A Wellness Center',
            'city'         => 'Mandalay',
            'state'        => 'Mandalay Region',
            'address'      => '78th Street, Between 30th & 31st St, Chanayethazan',
            'is_default'   => false,
        ]);

        // 3. Naypyidaw Branch - Express/Modern Theme
        Branch::create([
            'branch_name' => 'K&A Vitality Hub',
            'city'         => 'Naypyidaw',
            'state'        => 'Union Territory',
            'address'      => 'Thiri Mandala Ward, Zabuthiri Township',
            'is_default'   => false,
        ]);

        // 4. Taunggyi Branch - Nature/Highland Theme
        Branch::create([
            'branch_name' => 'K&A PureHealth',
            'city'         => 'Taunggyi',
            'state'        => 'Shan State',
            'address'      => 'Bogyoke Aung San Road, Near Myoma Market',
            'is_default'   => false,
        ]);
    }
}