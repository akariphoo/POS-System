<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            ['name' => 'MMK'],
            ['name' => 'CNY']
        ];

        foreach ($currencies as $currency) {
            // updateOrCreate prevents duplicate errors if you run the seeder twice
            Currency::updateOrCreate(
                ['name' => $currency['name']],
                $currency
            );
        }
    }
}
