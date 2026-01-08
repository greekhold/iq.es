<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductionRecord;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Supply;
use App\Models\SupplyMovement;
use App\Models\User;
use App\Enums\MovementType;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedCustomers();
        $this->seedProduction();
        $this->seedSales();
        $this->seedPurchases();
        $this->seedExpenses();
    }

    private function seedCustomers(): void
    {
        $customers = [
            ['name' => 'Toko Pak Budi', 'phone' => '081234567890', 'type' => 'AGEN', 'address' => 'Jl. Merdeka No. 10'],
            ['name' => 'Warung Bu Siti', 'phone' => '081234567891', 'type' => 'RETAIL', 'address' => 'Jl. Sudirman No. 5'],
            ['name' => 'Depot Air Segar', 'phone' => '081234567892', 'type' => 'RESELLER', 'address' => 'Jl. Pahlawan No. 20'],
            ['name' => 'Toko Makmur', 'phone' => '081234567893', 'type' => 'AGEN', 'address' => 'Jl. Ahmad Yani No. 15'],
            ['name' => 'Warung Sejahtera', 'phone' => '081234567894', 'type' => 'RETAIL', 'address' => 'Jl. Diponegoro No. 8'],
        ];

        foreach ($customers as $data) {
            Customer::create($data);
        }
    }

    private function seedProduction(): void
    {
        $products = Product::all();
        $user = User::first();

        // Create production for last 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            foreach ($products as $product) {
                // Random production quantity
                $quantity = rand(50, 200);
                $machineOn = $date->copy()->setTime(rand(6, 8), rand(0, 59));
                $machineOff = $machineOn->copy()->addHours(rand(4, 8));

                $record = ProductionRecord::create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'machine_on_at' => $machineOn,
                    'machine_off_at' => $machineOff,
                    'created_by' => $user->id,
                    'notes' => 'Produksi rutin',
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                // Add inventory movement
                $lastMovement = InventoryMovement::where('product_id', $product->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                $currentStock = $lastMovement ? $lastMovement->balance_after : 0;

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'movement_type' => MovementType::PRODUCTION_IN,
                    'quantity' => $quantity,
                    'balance_after' => $currentStock + $quantity,
                    'reference_id' => $record->id,
                    'reference_type' => ProductionRecord::class,
                    'created_by' => $user->id,
                    'created_at' => $date,
                ]);
            }
        }
    }

    private function seedSales(): void
    {
        $products = Product::all();
        $customers = Customer::all();
        $user = User::first();

        // Create sales for last 7 days
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // 3-8 sales per day
            $numSales = rand(3, 8);

            for ($j = 0; $j < $numSales; $j++) {
                $customer = $customers->random();
                $salesChannel = collect(['FACTORY', 'FIELD'])->random();
                $paymentMethod = collect(['CASH', 'TRANSFER'])->random();

                $sale = Sale::create([
                    'invoice_number' => 'INV-' . $date->format('Ymd') . '-' . str_pad($j + 1, 3, '0', STR_PAD_LEFT),
                    'customer_id' => $customer->id,
                    'sales_channel' => $salesChannel,
                    'payment_method' => $paymentMethod,
                    'total_amount' => 0,
                    'status' => 'completed',
                    'created_by' => $user->id,
                    'sold_at' => $date,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                // Add 1-3 items per sale
                $numItems = rand(1, 3);
                $total = 0;
                $usedProducts = [];

                for ($k = 0; $k < $numItems; $k++) {
                    $product = $products->whereNotIn('id', $usedProducts)->random();
                    $usedProducts[] = $product->id;

                    $quantity = rand(5, 30);
                    $price = $product->prices->first();
                    $priceSnapshot = $price ? $price->price : 5000;
                    $subtotal = $quantity * $priceSnapshot;
                    $total += $subtotal;

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'price_id' => $price ? $price->id : null,
                        'price_snapshot' => $priceSnapshot,
                        'quantity' => $quantity,
                        'subtotal' => $subtotal,
                    ]);

                    // Deduct inventory
                    $lastMovement = InventoryMovement::where('product_id', $product->id)
                        ->orderBy('created_at', 'desc')
                        ->first();
                    $currentStock = $lastMovement ? $lastMovement->balance_after : 0;

                    InventoryMovement::create([
                        'product_id' => $product->id,
                        'movement_type' => $salesChannel === 'FACTORY' ? MovementType::SALE_FACTORY : MovementType::SALE_FIELD,
                        'quantity' => $quantity,
                        'balance_after' => max(0, $currentStock - $quantity),
                        'reference_id' => $sale->id,
                        'reference_type' => Sale::class,
                        'created_by' => $user->id,
                        'created_at' => $date,
                    ]);
                }

                $sale->update(['total_amount' => $total]);
            }
        }
    }

    private function seedPurchases(): void
    {
        $supplies = Supply::all();
        $user = User::first();

        $suppliers = ['Toko Plastik Jaya', 'CV Makmur Plastik', 'UD Sejahtera', 'Toko Galon Murah'];

        // Create purchases for last 7 days
        for ($i = 6; $i >= 0; $i--) {
            if (rand(0, 1) === 0)
                continue; // Skip some days

            $date = Carbon::now()->subDays($i);

            $purchase = Purchase::create([
                'invoice_number' => 'PUR-' . $date->format('Ymd') . '-001',
                'supplier_name' => collect($suppliers)->random(),
                'total_amount' => 0,
                'purchased_at' => $date,
                'notes' => 'Pembelian rutin',
                'created_by' => $user->id,
                'created_at' => $date,
                'updated_at' => $date,
            ]);

            // Add 2-4 items
            $numItems = rand(2, 4);
            $total = 0;
            $usedSupplies = [];

            for ($j = 0; $j < $numItems; $j++) {
                $supply = $supplies->whereNotIn('id', $usedSupplies)->random();
                $usedSupplies[] = $supply->id;

                $quantity = rand(50, 200);
                $pricePerUnit = rand(500, 3000);
                $subtotal = $quantity * $pricePerUnit;
                $total += $subtotal;

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'supply_id' => $supply->id,
                    'quantity' => $quantity,
                    'price_per_unit' => $pricePerUnit,
                    'subtotal' => $subtotal,
                ]);

                // Add supply stock
                $supply->increment('current_stock', $quantity);

                SupplyMovement::create([
                    'supply_id' => $supply->id,
                    'movement_type' => 'PURCHASE_IN',
                    'quantity' => $quantity,
                    'balance_after' => $supply->current_stock,
                    'reference_type' => Purchase::class,
                    'reference_id' => $purchase->id,
                    'created_by' => $user->id,
                    'created_at' => $date,
                ]);
            }

            $purchase->update(['total_amount' => $total]);
        }
    }

    private function seedExpenses(): void
    {
        $categories = ExpenseCategory::all();
        $user = User::first();

        $expenseTypes = [
            ['description' => 'Bayar listrik', 'amount' => [500000, 1500000]],
            ['description' => 'Bayar PDAM', 'amount' => [200000, 500000]],
            ['description' => 'Gaji karyawan', 'amount' => [2000000, 5000000]],
            ['description' => 'Bensin motor', 'amount' => [100000, 300000]],
            ['description' => 'Maintenance mesin', 'amount' => [500000, 2000000]],
            ['description' => 'Ongkos kirim', 'amount' => [50000, 200000]],
        ];

        // Create expenses for last 7 days
        for ($i = 6; $i >= 0; $i--) {
            if (rand(0, 2) === 0)
                continue; // Skip some days

            $date = Carbon::now()->subDays($i);

            // 1-2 expenses per day
            $numExpenses = rand(1, 2);

            for ($j = 0; $j < $numExpenses; $j++) {
                $expense = collect($expenseTypes)->random();
                $category = $categories->random();

                Expense::create([
                    'category_id' => $category->id,
                    'description' => $expense['description'],
                    'amount' => rand($expense['amount'][0], $expense['amount'][1]),
                    'expense_date' => $date->format('Y-m-d'),
                    'notes' => null,
                    'created_by' => $user->id,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
    }
}
