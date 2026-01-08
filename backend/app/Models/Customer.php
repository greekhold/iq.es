<?php

namespace App\Models;

use App\Enums\CustomerType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'phone',
        'type',
        'address',
        'is_blacklisted',
        'blacklist_reason',
    ];

    protected $casts = [
        'type' => CustomerType::class,
        'is_blacklisted' => 'boolean',
    ];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function getTotalPurchasesAttribute(): float
    {
        return $this->sales()->where('status', 'completed')->sum('total_amount');
    }

    public function getPurchaseCountAttribute(): int
    {
        return $this->sales()->where('status', 'completed')->count();
    }

    /**
     * Get unpaid sales for this customer
     */
    public function unpaidSales(): HasMany
    {
        return $this->hasMany(Sale::class)->unpaid();
    }

    /**
     * Check if customer has any overdue payments
     */
    public function hasOverduePayments(): bool
    {
        return $this->sales()->overdue()->exists();
    }

    /**
     * Get total unpaid amount
     */
    public function getTotalUnpaidAttribute(): float
    {
        return $this->sales()->unpaid()->sum('total_amount');
    }

    /**
     * Blacklist this customer
     */
    public function blacklist(string $reason = null): void
    {
        $this->update([
            'is_blacklisted' => true,
            'blacklist_reason' => $reason ?? 'Pembayaran melebihi batas waktu',
        ]);
    }

    /**
     * Remove blacklist from customer
     */
    public function unblacklist(): void
    {
        $this->update([
            'is_blacklisted' => false,
            'blacklist_reason' => null,
        ]);
    }

    /**
     * Scope to exclude blacklisted customers
     */
    public function scopeActive($query)
    {
        return $query->where('is_blacklisted', false);
    }

    /**
     * Scope to get only blacklisted customers
     */
    public function scopeBlacklisted($query)
    {
        return $query->where('is_blacklisted', true);
    }
}
