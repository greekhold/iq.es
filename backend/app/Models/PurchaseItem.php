<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseItem extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'purchase_id',
        'supply_id',
        'quantity',
        'price_per_unit',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_per_unit' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function supply(): BelongsTo
    {
        return $this->belongsTo(Supply::class);
    }

    protected static function booted(): void
    {
        static::creating(function ($item) {
            $item->subtotal = $item->quantity * $item->price_per_unit;
            $item->created_at = now();
        });
    }
}
