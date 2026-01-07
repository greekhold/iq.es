<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\SalesChannel;
use App\Enums\SyncStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'sales_channel',
        'payment_method',
        'total_amount',
        'status',
        'sync_status',
        'created_by',
        'sold_at',
    ];

    protected $casts = [
        'sales_channel' => SalesChannel::class,
        'payment_method' => PaymentMethod::class,
        'sync_status' => SyncStatus::class,
        'total_amount' => 'decimal:2',
        'sold_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class, 'reference_id')
            ->where('reference_type', self::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeFactory($query)
    {
        return $query->where('sales_channel', SalesChannel::FACTORY);
    }

    public function scopeField($query)
    {
        return $query->where('sales_channel', SalesChannel::FIELD);
    }

    public function scopeNeedsSync($query)
    {
        return $query->where('sync_status', SyncStatus::PENDING);
    }

    public static function generateInvoiceNumber(SalesChannel $channel): string
    {
        $prefix = $channel === SalesChannel::FACTORY ? 'FAC' : 'FLD';
        $date = now()->format('Ymd');
        $sequence = static::whereDate('created_at', today())
            ->where('sales_channel', $channel)
            ->count() + 1;

        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }
}
