<?php

namespace App\Services\Pricing;

use App\Models\Price;
use App\Models\User;
use Illuminate\Support\Collection;

class PricingService
{
    /**
     * Get available prices for a user based on their role and the sales channel
     */
    public function getAvailablePrices(User $user, string $channel, ?string $productId = null): Collection
    {
        $query = Price::query()
            ->with('product')
            ->active()
            ->valid()
            ->forChannel($channel)
            ->whereHas('roleAccess', function ($q) use ($user) {
                $q->where('role_id', $user->role_id);
            });

        if ($productId) {
            $query->where('product_id', $productId);
        }

        return $query->orderBy('price', 'asc')->get();
    }

    /**
     * Validate if a price can be used by a user in a specific channel
     */
    public function validatePriceForUser(Price $price, User $user, string $channel): bool
    {
        // Check if price is active
        if (!$price->is_active) {
            return false;
        }

        // Check if price is valid for the channel
        if ($price->sales_channel !== 'ALL' && $price->sales_channel !== $channel) {
            return false;
        }

        // Check validity period
        if ($price->valid_until && $price->valid_until->isPast()) {
            return false;
        }

        // Check if user's role has access
        return $price->isValidForRole($user->role_id);
    }

    /**
     * Get price snapshot for recording in transactions
     */
    public function getPriceSnapshot(Price $price): array
    {
        return [
            'price_id' => $price->id,
            'price' => $price->price,
            'product_id' => $price->product_id,
            'product_name' => $price->product->name,
            'captured_at' => now()->toIso8601String(),
        ];
    }
}
