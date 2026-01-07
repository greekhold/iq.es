<?php

namespace App\Models;

use App\Enums\SalesChannel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Price extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'price',
        'sales_channel',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function roleAccess(): HasMany
    {
        return $this->hasMany(RolePriceAccess::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForChannel($query, string $channel)
    {
        return $query->where(function ($q) use ($channel) {
            $q->where('sales_channel', $channel)
                ->orWhere('sales_channel', 'ALL');
        });
    }

    public function scopeValid($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('valid_until')
                ->orWhere('valid_until', '>', now());
        });
    }

    public function isValidForRole(string $roleId): bool
    {
        return $this->roleAccess()->where('role_id', $roleId)->exists();
    }
}
