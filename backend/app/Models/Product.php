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
        'status',
    ];

    protected $casts = [
        'weight_kg' => 'decimal:2',
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
}
