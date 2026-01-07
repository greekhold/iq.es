<?php

namespace App\Services\Sales;

use App\Enums\MovementType;
use App\Enums\SalesChannel;
use App\Enums\SyncStatus;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\PriceNotAllowedException;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Price;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Services\Inventory\InventoryService;
use App\Services\Pricing\PricingService;
use Illuminate\Support\Facades\DB;

class SalesService
{
    public function __construct(
        private InventoryService $inventoryService,
        private PricingService $pricingService
    ) {
    }

    /**
     * Create a new sale transaction
     */
    public function createSale(
        User $user,
        SalesChannel $channel,
        array $items,
        string $paymentMethod,
        ?string $customerId = null,
        ?string $soldAt = null
    ): Sale {
        return DB::transaction(function () use ($user, $channel, $items, $paymentMethod, $customerId, $soldAt) {
            // Validate all items first
            $validatedItems = $this->validateItems($user, $channel, $items);

            // Calculate total
            $totalAmount = collect($validatedItems)->sum('subtotal');

            // Create sale record
            $sale = Sale::create([
                'invoice_number' => Sale::generateInvoiceNumber($channel),
                'customer_id' => $customerId,
                'sales_channel' => $channel,
                'payment_method' => $paymentMethod,
                'total_amount' => $totalAmount,
                'status' => 'completed',
                'sync_status' => $channel === SalesChannel::FIELD ? SyncStatus::PENDING : SyncStatus::SYNCED,
                'created_by' => $user->id,
                'sold_at' => $soldAt ? now()->parse($soldAt) : now(),
            ]);

            // Create sale items and inventory movements
            foreach ($validatedItems as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'price_id' => $item['price_id'],
                    'price_snapshot' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Record inventory movement
                $product = Product::find($item['product_id']);
                $movementType = $channel === SalesChannel::FACTORY
                    ? MovementType::SALE_FACTORY
                    : MovementType::SALE_FIELD;

                $this->inventoryService->recordMovement(
                    $product,
                    $movementType,
                    $item['quantity'],
                    $user,
                    $sale
                );
            }

            // Log audit
            AuditLog::log('CREATE', Sale::class, $sale->id, null, $sale->toArray());

            return $sale->load(['items.product', 'customer', 'createdBy']);
        });
    }

    /**
     * Validate and prepare sale items
     */
    private function validateItems(User $user, SalesChannel $channel, array $items): array
    {
        $validatedItems = [];

        foreach ($items as $item) {
            $price = Price::findOrFail($item['price_id']);
            $product = Product::findOrFail($item['product_id']);

            // Validate price access
            if (!$this->pricingService->validatePriceForUser($price, $user, $channel->value)) {
                throw new PriceNotAllowedException(
                    "Harga tidak diizinkan untuk produk: {$product->name}"
                );
            }

            // Validate price matches product
            if ($price->product_id !== $product->id) {
                throw new \InvalidArgumentException(
                    "Harga tidak sesuai dengan produk: {$product->name}"
                );
            }

            // Validate stock availability
            $currentStock = $this->inventoryService->calculateStock($product->id);
            if ($currentStock < $item['quantity']) {
                throw new InsufficientStockException(
                    "Stok {$product->name} tidak mencukupi. Tersedia: {$currentStock}, diminta: {$item['quantity']}"
                );
            }

            $validatedItems[] = [
                'product_id' => $product->id,
                'price_id' => $price->id,
                'price' => $price->price,
                'quantity' => $item['quantity'],
                'subtotal' => $price->price * $item['quantity'],
            ];
        }

        return $validatedItems;
    }

    /**
     * Cancel a sale (creates reverse inventory movements)
     */
    public function cancelSale(Sale $sale, User $user): Sale
    {
        if ($sale->status === 'cancelled') {
            throw new \InvalidArgumentException('Penjualan sudah dibatalkan sebelumnya');
        }

        return DB::transaction(function () use ($sale, $user) {
            $oldData = $sale->toArray();

            // Create reverse inventory movements
            foreach ($sale->items as $item) {
                $product = $item->product;

                $this->inventoryService->recordMovement(
                    $product,
                    MovementType::RETURN ,
                    $item->quantity,
                    $user,
                    $sale
                );
            }

            // Update sale status
            $sale->update(['status' => 'cancelled']);

            // Log audit
            AuditLog::log('CANCEL', Sale::class, $sale->id, $oldData, $sale->fresh()->toArray());

            return $sale->fresh(['items.product', 'customer', 'createdBy']);
        });
    }

    /**
     * Get sales summary for a period
     */
    public function getSalesSummary(string $startDate, string $endDate, ?SalesChannel $channel = null): array
    {
        $query = Sale::completed()
            ->whereBetween('sold_at', [$startDate, $endDate]);

        if ($channel) {
            $query->where('sales_channel', $channel);
        }

        $sales = $query->get();

        return [
            'total_transactions' => $sales->count(),
            'total_amount' => $sales->sum('total_amount'),
            'by_channel' => [
                'FACTORY' => $sales->where('sales_channel', SalesChannel::FACTORY)->sum('total_amount'),
                'FIELD' => $sales->where('sales_channel', SalesChannel::FIELD)->sum('total_amount'),
            ],
            'by_payment' => [
                'CASH' => $sales->where('payment_method', 'CASH')->sum('total_amount'),
                'TRANSFER' => $sales->where('payment_method', 'TRANSFER')->sum('total_amount'),
            ],
        ];
    }
}
