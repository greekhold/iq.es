<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Es Kristal 5kg',
                'sku' => 'ICE-5KG',
                'weight_kg' => 5.00,
            ],
            [
                'name' => 'Es Kristal 1kg',
                'sku' => 'ICE-1KG',
                'weight_kg' => 1.00,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['sku' => $product['sku']],
                $product
            );
        }
    }
}
