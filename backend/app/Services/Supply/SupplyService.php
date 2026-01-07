<?php

namespace App\Services\Supply;

use App\Models\Supply;
use App\Models\SupplyMovement;
use Illuminate\Support\Facades\DB;

class SupplyService
{
    /**
     * Add stock from purchase
     */
    public function addStock(string $supplyId, int $quantity, ?string $referenceType = null, ?string $referenceId = null, ?string $userId = null): SupplyMovement
    {
        return DB::transaction(function () use ($supplyId, $quantity, $referenceType, $referenceId, $userId) {
            $supply = Supply::lockForUpdate()->findOrFail($supplyId);
            $newBalance = $supply->current_stock + $quantity;

            $supply->update(['current_stock' => $newBalance]);

            return SupplyMovement::create([
                'supply_id' => $supplyId,
                'movement_type' => 'PURCHASE_IN',
                'quantity' => $quantity,
                'balance_after' => $newBalance,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'created_by' => $userId,
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Deduct stock from sale (auto-deduct linked supplies)
     */
    public function deductForSale(string $productId, int $saleQuantity, ?string $referenceType = null, ?string $referenceId = null, ?string $userId = null): array
    {
        return DB::transaction(function () use ($productId, $saleQuantity, $referenceType, $referenceId, $userId) {
            // Find supplies linked to this product
            $supplies = Supply::where('linked_product_id', $productId)
                ->where('is_active', true)
                ->lockForUpdate()
                ->get();

            $movements = [];

            foreach ($supplies as $supply) {
                $deductQuantity = $supply->deduct_per_sale * $saleQuantity;

                // Allow negative stock (warning only)
                $newBalance = $supply->current_stock - $deductQuantity;
                $supply->update(['current_stock' => $newBalance]);

                $movements[] = SupplyMovement::create([
                    'supply_id' => $supply->id,
                    'movement_type' => 'SALE_OUT',
                    'quantity' => -$deductQuantity,
                    'balance_after' => $newBalance,
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'created_by' => $userId,
                    'created_at' => now(),
                ]);
            }

            return $movements;
        });
    }

    /**
     * Adjust stock manually
     */
    public function adjustStock(string $supplyId, int $quantity, ?string $userId = null): SupplyMovement
    {
        return DB::transaction(function () use ($supplyId, $quantity, $userId) {
            $supply = Supply::lockForUpdate()->findOrFail($supplyId);
            $newBalance = $supply->current_stock + $quantity;

            $supply->update(['current_stock' => $newBalance]);

            return SupplyMovement::create([
                'supply_id' => $supplyId,
                'movement_type' => 'ADJUSTMENT',
                'quantity' => $quantity,
                'balance_after' => $newBalance,
                'created_by' => $userId,
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Get low stock supplies
     */
    public function getLowStockSupplies()
    {
        return Supply::active()
            ->lowStock()
            ->get();
    }
}
