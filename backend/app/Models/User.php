<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role?->name,
            'permissions' => $this->role?->permissions ?? [],
        ];
    }

    // Relationships
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'created_by');
    }

    public function productionRecords(): HasMany
    {
        return $this->hasMany(ProductionRecord::class, 'created_by');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function syncQueue(): HasMany
    {
        return $this->hasMany(SyncQueue::class);
    }

    // Helper Methods
    public function hasPermission(string $permission): bool
    {
        return $this->role?->hasPermission($permission) ?? false;
    }

    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    public function isOwner(): bool
    {
        return $this->role?->name === 'OWNER';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role?->name, ['OWNER', 'ADMIN']);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
