<?php

namespace App\Services\Production;

use App\Enums\MovementType;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\ProductionRecord;
use App\Models\User;
use App\Services\Inventory\InventoryService;
use Illuminate\Support\Facades\DB;

class ProductionService
{
    public function __construct(
        private InventoryService $inventoryService
    ) {
    }

    /**
     * Record production output
     */
    public function recordProduction(
        User $user,
        string $productId,
        int $quantity,
        string $machineOnAt,
        string $machineOffAt,
        ?string $notes = null
    ): ProductionRecord {
        return DB::transaction(function () use ($user, $productId, $quantity, $machineOnAt, $machineOffAt, $notes) {
            $product = Product::findOrFail($productId);

            // Create production record
            $record = ProductionRecord::create([
                'product_id' => $productId,
                'quantity' => $quantity,
                'machine_on_at' => $machineOnAt,
                'machine_off_at' => $machineOffAt,
                'created_by' => $user->id,
                'notes' => $notes,
            ]);

            // Record inventory movement
            $this->inventoryService->recordMovement(
                $product,
                MovementType::PRODUCTION_IN,
                $quantity,
                $user,
                $record
            );

            // Log audit
            AuditLog::log('CREATE', ProductionRecord::class, $record->id, null, $record->toArray());

            return $record->load(['product', 'createdBy']);
        });
    }

    /**
     * Get production summary for a period
     */
    public function getProductionSummary(string $startDate, string $endDate): array
    {
        $records = ProductionRecord::with('product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $byProduct = $records->groupBy('product_id')->map(function ($items, $productId) {
            $product = $items->first()->product;
            return [
                'product_id' => $productId,
                'product_name' => $product->name,
                'sku' => $product->sku,
                'total_quantity' => $items->sum('quantity'),
                'record_count' => $items->count(),
                'total_minutes' => $items->sum('duration_minutes'),
            ];
        });

        return [
            'total_quantity' => $records->sum('quantity'),
            'total_records' => $records->count(),
            'by_product' => $byProduct->values()->toArray(),
        ];
    }
}
