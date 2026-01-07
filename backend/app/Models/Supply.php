<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supply extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'sku',
        'unit',
        'current_stock',
        'min_stock',
        'linked_product_id',
        'deduct_per_sale',
        'is_active',
    ];

    protected $casts = [
        'current_stock' => 'integer',
        'min_stock' => 'integer',
        'deduct_per_sale' => 'integer',
        'is_active' => 'boolean',
    ];

    public function linkedProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'linked_product_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(SupplyMovement::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('current_stock', '<=', 'min_stock');
    }

    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->min_stock;
    }
}
