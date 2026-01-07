<?php

namespace App\Services\Sync;

use App\Enums\MovementType;
use App\Enums\SalesChannel;
use App\Enums\SyncStatus;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SyncQueue;
use App\Models\User;
use App\Services\Inventory\InventoryService;
use App\Services\Sales\SalesService;
use Illuminate\Support\Facades\DB;

class SyncService
{
    public function __construct(
        private SalesService $salesService,
        private InventoryService $inventoryService
    ) {
    }

    /**
     * Process offline transactions from supplier
     */
    public function pushTransactions(array $transactions, User $user): array
    {
        $results = [];

        foreach ($transactions as $tx) {
            try {
                $result = $this->processTransaction($tx, $user);
                $results[] = $result;
            } catch (\Exception $e) {
                $results[] = [
                    'local_id' => $tx['local_id'] ?? null,
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Process a single transaction
     */
    private function processTransaction(array $tx, User $user): array
    {
        return DB::transaction(function () use ($tx, $user) {
            // Check for stock conflicts
            $hasConflict = $this->checkStockConflict($tx['items']);

            if ($hasConflict) {
                // Create sync queue entry for admin review
                $syncEntry = SyncQueue::create([
                    'user_id' => $user->id,
                    'action' => 'CREATE_SALE',
                    'payload' => $tx,
                    'status' => SyncStatus::CONFLICT,
                    'error_message' => 'Stok tidak mencukupi saat sync',
                ]);

                return [
                    'local_id' => $tx['local_id'],
                    'status' => 'conflict',
                    'queue_id' => $syncEntry->id,
                    'message' => 'Transaksi ditandai untuk review admin',
                ];
            }

            // Create the sale
            $sale = $this->salesService->createSale(
                $user,
                SalesChannel::FIELD,
                $tx['items'],
                $tx['payment_method'],
                $tx['customer_id'] ?? null,
                $tx['sold_at'] ?? null
            );

            // Update sync status
            $sale->update(['sync_status' => SyncStatus::SYNCED]);

            return [
                'local_id' => $tx['local_id'],
                'status' => 'synced',
                'sale_id' => $sale->id,
                'invoice_number' => $sale->invoice_number,
            ];
        });
    }

    /**
     * Check if any items have stock conflicts
     */
    private function checkStockConflict(array $items): bool
    {
        foreach ($items as $item) {
            $currentStock = $this->inventoryService->calculateStock($item['product_id']);
            if ($currentStock < $item['quantity']) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get pending conflicts for admin review
     */
    public function getConflicts(): \Illuminate\Database\Eloquent\Collection
    {
        return SyncQueue::with('user')
            ->conflict()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Resolve a conflict by admin
     */
    public function resolveConflict(SyncQueue $syncEntry, string $resolution, User $admin): array
    {
        return DB::transaction(function () use ($syncEntry, $resolution, $admin) {
            if ($resolution === 'approve') {
                // Force create the sale even with low stock
                $payload = $syncEntry->payload;
                $sale = $this->salesService->createSale(
                    $syncEntry->user,
                    SalesChannel::FIELD,
                    $payload['items'],
                    $payload['payment_method'],
                    $payload['customer_id'] ?? null,
                    $payload['sold_at'] ?? null
                );

                $syncEntry->markAsSynced();

                return [
                    'status' => 'resolved',
                    'sale_id' => $sale->id,
                ];
            } else {
                // Reject the transaction
                $syncEntry->update([
                    'status' => SyncStatus::FAILED,
                    'error_message' => 'Ditolak oleh admin: ' . $admin->name,
                ]);

                return [
                    'status' => 'rejected',
                ];
            }
        });
    }
}
