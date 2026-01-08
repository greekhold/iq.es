<?php

namespace App\Services\Inventory;

use App\Enums\MovementType;
use App\Exceptions\InsufficientStockException;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Record an inventory movement and update stock balance
     * All stock changes MUST go through this method
     */
    public function recordMovement(
        Product $product,
        MovementType $type,
        int $quantity,
        User $user,
        ?Model $reference = null
    ): InventoryMovement {
        return DB::transaction(function () use ($product, $type, $quantity, $user, $reference) {
            // Lock the product's latest movement for update to prevent race conditions
            $currentStock = $this->calculateStock($product->id, true);

            // Calculate new balance based on movement type
            $newBalance = $this->calculateNewBalance($currentStock, $type, $quantity);

            // Validate stock for subtraction operations
            if ($newBalance < 0 && !$this->allowsNegativeStock($type)) {
                throw new InsufficientStockException(
                    "Stok tidak mencukupi. Stok saat ini: {$currentStock}, permintaan: {$quantity}"
                );
            }

            return InventoryMovement::create([
                'product_id' => $product->id,
                'movement_type' => $type,
                'quantity' => $quantity,
                'balance_after' => $newBalance,
                'reference_id' => $reference?->id,
                'reference_type' => $reference ? get_class($reference) : null,
                'created_by' => $user->id,
                'created_at' => now(),
            ]);
        });
    }

    /**
     * Calculate current stock for a product
     */
    public function calculateStock(string $productId, bool $lockForUpdate = false): int
    {
        $query = InventoryMovement::where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $lastMovement = $query->first();

        return $lastMovement?->balance_after ?? 0;
    }

    /**
     * Get stock for all products
     */
    public function getAllStock(): array
    {
        $products = Product::active()->get();
        $stocks = [];

        foreach ($products as $product) {
            $stocks[$product->id] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sku' => $product->sku,
                'weight_kg' => $product->weight_kg,
                'current_stock' => $this->calculateStock($product->id),
            ];
        }

        return $stocks;
    }

    /**
     * Calculate the new balance after movement
     */
    private function calculateNewBalance(int $currentStock, MovementType $type, int $quantity): int
    {
        $newBalance = match ($type) {
            MovementType::PRODUCTION_IN, MovementType::RETURN => $currentStock + $quantity,
            MovementType::SALE_FACTORY, MovementType::SALE_FIELD => $currentStock - $quantity,
            MovementType::ADJUSTMENT => $currentStock + $quantity, // quantity can be negative for reduction
        };

        // Ensure stock never goes below 0
        return max(0, $newBalance);
    }

    /**
     * Check if movement type allows negative stock
     */
    private function allowsNegativeStock(MovementType $type): bool
    {
        // No movement type allows negative stock
        return false;
    }

    /**
     * Get movement history for a product
     */
    public function getMovementHistory(
        string $productId,
        ?string $startDate = null,
        ?string $endDate = null
    ): \Illuminate\Database\Eloquent\Collection {
        $query = InventoryMovement::with(['createdBy', 'product'])
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc');

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        return $query->get();
    }
}
