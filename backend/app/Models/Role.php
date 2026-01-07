<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'display_name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function priceAccess(): HasMany
    {
        return $this->hasMany(RolePriceAccess::class);
    }

    public function hasPermission(string $permission): bool
    {
        if (in_array('*', $this->permissions)) {
            return true;
        }
        return in_array($permission, $this->permissions);
    }
}
