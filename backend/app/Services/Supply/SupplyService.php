<?php

namespace App\Services\Supply;

use App\Models\Product;
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
     * Deduct supply for production (e.g., Plastik Es for ice production)
     */
    public function deductForProduction(string $productId, int $productionQuantity, ?string $referenceType = null, ?string $referenceId = null, ?string $userId = null): array
    {
        return DB::transaction(function () use ($productId, $productionQuantity, $referenceType, $referenceId, $userId) {
            $movements = [];

            // Deduct supplies linked directly to this product (e.g., Plastik Es)
            $linkedSupplies = Supply::where('linked_product_id', $productId)
                ->where('is_active', true)
                ->lockForUpdate()
                ->get();

            foreach ($linkedSupplies as $supply) {
                $deductQuantity = $supply->deduct_per_sale * $productionQuantity;

                $newBalance = max(0, $supply->current_stock - $deductQuantity);
                $supply->update(['current_stock' => $newBalance]);

                $movements[] = SupplyMovement::create([
                    'supply_id' => $supply->id,
                    'movement_type' => 'PRODUCTION_OUT',
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
     * Deduct galon supplies for NEW galon sale (not refill)
     */
    public function deductForNewGalon(int $quantity, ?string $referenceType = null, ?string $referenceId = null, ?string $userId = null): array
    {
        return DB::transaction(function () use ($quantity, $referenceType, $referenceId, $userId) {
            $movements = [];

            $galonSupply = Supply::where('sku', 'GLN-EMPTY')->lockForUpdate()->first();
            $tutupSupply = Supply::where('sku', 'TTP-GLN')->lockForUpdate()->first();

            // Deduct Galon Kosong
            if ($galonSupply) {
                $newBalance = max(0, $galonSupply->current_stock - $quantity);
                $galonSupply->update(['current_stock' => $newBalance]);

                $movements[] = SupplyMovement::create([
                    'supply_id' => $galonSupply->id,
                    'movement_type' => 'SALE_OUT',
                    'quantity' => -$quantity,
                    'balance_after' => $newBalance,
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'created_by' => $userId,
                    'created_at' => now(),
                ]);
            }

            // Deduct Tutup Galon
            if ($tutupSupply) {
                $newBalance = max(0, $tutupSupply->current_stock - $quantity);
                $tutupSupply->update(['current_stock' => $newBalance]);

                $movements[] = SupplyMovement::create([
                    'supply_id' => $tutupSupply->id,
                    'movement_type' => 'SALE_OUT',
                    'quantity' => -$quantity,
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
            $newBalance = max(0, $supply->current_stock + $quantity);

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
