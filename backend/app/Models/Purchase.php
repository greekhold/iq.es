<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_number',
        'supplier_name',
        'total_amount',
        'notes',
        'purchased_at',
        'created_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'purchased_at' => 'date',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'PUR';
        $date = now()->format('Ymd');
        $lastPurchase = static::whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->first();

        if ($lastPurchase) {
            $lastNumber = (int) substr($lastPurchase->invoice_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$date}-{$newNumber}";
    }
}
