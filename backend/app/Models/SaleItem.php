<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'sale_id',
        'product_id',
        'price_id',
        'price_snapshot',
        'quantity',
        'subtotal',
        'created_at',
    ];

    protected $casts = [
        'price_snapshot' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function price(): BelongsTo
    {
        return $this->belongsTo(Price::class);
    }

    protected static function booted(): void
    {
        static::creating(function (SaleItem $item) {
            if (empty($item->subtotal)) {
                $item->subtotal = $item->price_snapshot * $item->quantity;
            }
            if (empty($item->created_at)) {
                $item->created_at = now();
            }
        });
    }
}
