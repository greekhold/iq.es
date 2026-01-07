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
    ];

    protected $casts = [
        'type' => CustomerType::class,
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
}
