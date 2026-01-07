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
        $product5kg = Product::where('sku', 'ICE-5KG')->first();
        $product1kg = Product::where('sku', 'ICE-1KG')->first();

        $roles = Role::all()->keyBy('name');

        // Prices for Es 5kg
        $prices5kg = [
            ['price' => 4500, 'roles' => ['OWNER', 'ADMIN']],
            ['price' => 5000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK']],
            ['price' => 6000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
            ['price' => 7000, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
        ];

        // Prices for Es 1kg
        $prices1kg = [
            ['price' => 1000, 'roles' => ['OWNER', 'ADMIN']],
            ['price' => 1200, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK']],
            ['price' => 1500, 'roles' => ['OWNER', 'ADMIN', 'KASIR_PABRIK', 'SUPPLIER']],
        ];

        if ($product5kg) {
            foreach ($prices5kg as $priceData) {
                $price = Price::create([
                    'product_id' => $product5kg->id,
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

        if ($product1kg) {
            foreach ($prices1kg as $priceData) {
                $price = Price::create([
                    'product_id' => $product1kg->id,
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
