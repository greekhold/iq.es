<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Gaji Karyawan', 'icon' => 'users'],
            ['name' => 'Listrik', 'icon' => 'zap'],
            ['name' => 'Air', 'icon' => 'droplet'],
            ['name' => 'Transport', 'icon' => 'truck'],
            ['name' => 'Perawatan Mesin', 'icon' => 'settings'],
            ['name' => 'Sewa Tempat', 'icon' => 'home'],
            ['name' => 'Lain-lain', 'icon' => 'more-horizontal'],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::create($category);
        }
    }
}
