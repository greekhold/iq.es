<?php

namespace App\Services\Purchase;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Services\Supply\SupplyService;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function __construct(
        protected SupplyService $supplyService
    ) {
    }

    public function create(array $data, string $userId): Purchase
    {
        return DB::transaction(function () use ($data, $userId) {
            $purchase = Purchase::create([
                'invoice_number' => Purchase::generateInvoiceNumber(),
                'supplier_name' => $data['supplier_name'] ?? null,
                'notes' => $data['notes'] ?? null,
                'purchased_at' => $data['purchased_at'] ?? now(),
                'created_by' => $userId,
                'total_amount' => 0,
            ]);

            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['price_per_unit'];

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'supply_id' => $item['supply_id'],
                    'quantity' => $item['quantity'],
                    'price_per_unit' => $item['price_per_unit'],
                    'subtotal' => $subtotal,
                ]);

                // Add to supply stock
                $this->supplyService->addStock(
                    $item['supply_id'],
                    $item['quantity'],
                    Purchase::class,
                    $purchase->id,
                    $userId
                );

                $totalAmount += $subtotal;
            }

            $purchase->update(['total_amount' => $totalAmount]);

            return $purchase->fresh(['items.supply']);
        });
    }

    public function getAll(array $filters = [])
    {
        $query = Purchase::with(['items.supply', 'createdBy'])
            ->orderBy('purchased_at', 'desc');

        if (!empty($filters['start_date'])) {
            $query->whereDate('purchased_at', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('purchased_at', '<=', $filters['end_date']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getTotalByDateRange(string $startDate, string $endDate): float
    {
        return Purchase::whereDate('purchased_at', '>=', $startDate)
            ->whereDate('purchased_at', '<=', $endDate)
            ->sum('total_amount');
    }
}
