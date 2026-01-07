<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Es Kristal - requires stock (production first)
            [
                'name' => 'Es Kristal 5kg',
                'sku' => 'ICE-5KG',
                'weight_kg' => 5.00,
                'requires_stock' => true,
            ],
            [
                'name' => 'Es Kristal 1kg',
                'sku' => 'ICE-1KG',
                'weight_kg' => 1.00,
                'requires_stock' => true,
            ],
            [
                'name' => 'Es Buntel',
                'sku' => 'ICE-BTL',
                'weight_kg' => 0.25,
                'requires_stock' => true,
            ],
            // Galon - no stock needed (fill on demand)
            [
                'name' => 'Galon O3',
                'sku' => 'GLN-O3',
                'weight_kg' => 19.00,
                'requires_stock' => false,
            ],
            [
                'name' => 'Galon RO',
                'sku' => 'GLN-RO',
                'weight_kg' => 19.00,
                'requires_stock' => false,
            ],
            [
                'name' => 'Galon Kangen Water',
                'sku' => 'GLN-KW',
                'weight_kg' => 19.00,
                'requires_stock' => false,
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
