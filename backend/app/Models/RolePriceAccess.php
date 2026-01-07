<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePriceAccess extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'role_price_access';

    protected $fillable = [
        'role_id',
        'price_id',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function price(): BelongsTo
    {
        return $this->belongsTo(Price::class);
    }
}
