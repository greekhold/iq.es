<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'sku',
        'weight_kg',
        'requires_stock',
        'status',
    ];

    protected $casts = [
        'weight_kg' => 'decimal:2',
        'requires_stock' => 'boolean',
    ];

    public function prices(): HasMany
    {
        return $this->hasMany(Price::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function productionRecords(): HasMany
    {
        return $this->hasMany(ProductionRecord::class);
    }

    public function linkedSupplies(): HasMany
    {
        return $this->hasMany(Supply::class, 'linked_product_id');
    }

    public function getCurrentStock(): int
    {
        $lastMovement = $this->inventoryMovements()
            ->orderBy('created_at', 'desc')
            ->first();

        return $lastMovement?->balance_after ?? 0;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeRequiresStock($query)
    {
        return $query->where('requires_stock', true);
    }

    public function scopeNoStockRequired($query)
    {
        return $query->where('requires_stock', false);
    }
}
