<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionRecord extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'quantity',
        'machine_on_at',
        'machine_off_at',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'machine_on_at' => 'datetime',
        'machine_off_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->machine_on_at->diffInMinutes($this->machine_off_at);
    }
}
