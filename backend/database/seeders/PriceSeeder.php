<?php

namespace Database\Seeders;

use App\Models\Price;
use App\Models\Product;
use App\Models\Role;
use App\Models\RolePriceAccess;
use Illuminate\Database\Seeder;

class PriceSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all()->keyBy('sku');
        $roles = Role::all()->keyBy('name');

        $allPrices = [
            // Es Kristal 5kg
            'ICE-5KG' => [
                ['price' => 4500, 'roles' => ['OWNER', 'ADMIN']],
                ['price' => 5000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK']],
                ['price' => 6000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
                ['price' => 7000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ],
            // Es Kristal 1kg
            'ICE-1KG' => [
                ['price' => 1000, 'roles' => ['OWNER', 'ADMIN']],
                ['price' => 1200, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK']],
                ['price' => 1500, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ],
            // Galon O3
            'GLN-O3' => [
                ['price' => 5000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ],
            // Galon RO
            'GLN-RO' => [
                ['price' => 10000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ],
            // Galon Kangen Water
            'GLN-KW' => [
                ['price' => 50000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ],
            // Es Buntel
            'ICE-BTL' => [
                ['price' => 1000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ],
        ];

        foreach ($allPrices as $sku => $priceList) {
            $product = $products[$sku] ?? null;
            if (!$product)
                continue;

            foreach ($priceList as $priceData) {
                $price = Price::create([
                    'product_id' => $product->id,
                    'price' => $priceData['price'],
                    'sales_channel' => 'ALL',
                    'is_active' => true,
                ]);

                foreach ($priceData['roles'] as $roleName) {
                    if (isset($roles[$roleName])) {
                        RolePriceAccess::create([
                            'role_id' => $roles[$roleName]->id,
                            'price_id' => $price->id,
                        ]);
                    }
                }
            }
        }
    }
}
