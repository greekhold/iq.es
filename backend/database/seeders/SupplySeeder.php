<?php

namespace Database\Seeders;

use App\Models\Supply;
use App\Models\Product;
use Illuminate\Database\Seeder;

class SupplySeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all()->keyBy('sku');

        $supplies = [
            // Plastik untuk es kristal
            [
                'name' => 'Plastik Es Kristal 5kg',
                'sku' => 'PLT-ICE-5KG',
                'unit' => 'pcs',
                'current_stock' => 500,
                'min_stock' => 100,
                'linked_product_sku' => 'ICE-5KG',
                'deduct_per_sale' => 1,
            ],
            [
                'name' => 'Plastik Es Kristal 1kg',
                'sku' => 'PLT-ICE-1KG',
                'unit' => 'pcs',
                'current_stock' => 1000,
                'min_stock' => 200,
                'linked_product_sku' => 'ICE-1KG',
                'deduct_per_sale' => 1,
            ],
            [
                'name' => 'Plastik Es Buntel',
                'sku' => 'PLT-ICE-BTL',
                'unit' => 'pcs',
                'current_stock' => 2000,
                'min_stock' => 500,
                'linked_product_sku' => 'ICE-BTL',
                'deduct_per_sale' => 1,
            ],
            // Galon Kosong & Tutup - tidak di-link ke produk spesifik
            // akan di-deduct manual untuk semua produk galon
            [
                'name' => 'Galon Kosong',
                'sku' => 'GLN-EMPTY',
                'unit' => 'pcs',
                'current_stock' => 100,
                'min_stock' => 20,
                'linked_product_sku' => null,
                'deduct_per_sale' => 0,
            ],
            [
                'name' => 'Tutup Galon',
                'sku' => 'TTP-GLN',
                'unit' => 'pcs',
                'current_stock' => 200,
                'min_stock' => 50,
                'linked_product_sku' => null,
                'deduct_per_sale' => 0,
            ],
            // Karet Gelang
            [
                'name' => 'Karet Gelang',
                'sku' => 'KRT-001',
                'unit' => 'pack',
                'current_stock' => 20,
                'min_stock' => 5,
                'linked_product_sku' => null,
                'deduct_per_sale' => 0,
            ],
        ];

        foreach ($supplies as $data) {
            $linkedProductId = null;
            if ($data['linked_product_sku'] && isset($products[$data['linked_product_sku']])) {
                $linkedProductId = $products[$data['linked_product_sku']]->id;
            }

            Supply::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    'name' => $data['name'],
                    'unit' => $data['unit'],
                    'current_stock' => $data['current_stock'],
                    'min_stock' => $data['min_stock'],
                    'linked_product_id' => $linkedProductId,
                    'deduct_per_sale' => $data['deduct_per_sale'],
                ]
            );
        }
    }
}
