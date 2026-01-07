<?php

namespace App\Services\Auth;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    /**
     * Attempt to authenticate user and generate tokens
     */
    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->active()->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Generate tokens
        $accessToken = JWTAuth::fromUser($user);

        // Log audit
        AuditLog::log('LOGIN', User::class, $user->id, null, [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return [
            'access_token' => $accessToken,
            'token_type' => 'Bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => $this->formatUser($user),
        ];
    }

    /**
     * Refresh the access token
     */
    public function refresh(): array
    {
        $newToken = JWTAuth::parseToken()->refresh();
        $user = JWTAuth::setToken($newToken)->toUser();

        return [
            'access_token' => $newToken,
            'token_type' => 'Bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => $this->formatUser($user),
        ];
    }

    /**
     * Logout user and invalidate token
     */
    public function logout(): void
    {
        $user = auth()->user();

        if ($user) {
            AuditLog::log('LOGOUT', User::class, $user->id);
        }

        JWTAuth::invalidate(JWTAuth::getToken());
    }

    /**
     * Get current authenticated user
     */
    public function me(): array
    {
        $user = auth()->user();
        return $this->formatUser($user);
    }

    /**
     * Format user data for response
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => [
                'id' => $user->role?->id,
                'name' => $user->role?->name,
                'display_name' => $user->role?->display_name,
            ],
            'permissions' => $user->role?->permissions ?? [],
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ];
    }
}
