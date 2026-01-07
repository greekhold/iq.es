<?php

namespace App\Models;

use App\Enums\SyncStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SyncQueue extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'sync_queue';

    protected $fillable = [
        'user_id',
        'action',
        'payload',
        'status',
        'retry_count',
        'error_message',
        'synced_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'status' => SyncStatus::class,
        'synced_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', SyncStatus::PENDING);
    }

    public function scopeConflict($query)
    {
        return $query->where('status', SyncStatus::CONFLICT);
    }

    public function markAsSynced(): void
    {
        $this->update([
            'status' => SyncStatus::SYNCED,
            'synced_at' => now(),
        ]);
    }

    public function markAsConflict(string $reason): void
    {
        $this->update([
            'status' => SyncStatus::CONFLICT,
            'error_message' => $reason,
        ]);
    }

    public function incrementRetry(): void
    {
        $this->increment('retry_count');
        if ($this->retry_count >= 3) {
            $this->update(['status' => SyncStatus::FAILED]);
        }
    }
}
