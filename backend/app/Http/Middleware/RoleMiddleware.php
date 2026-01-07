<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $userRole = $user->role?->name;

        // Owner has access to everything
        if ($userRole === 'OWNER') {
            return $next($request);
        }

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Role tidak memiliki izin.',
            ], 403);
        }

        return $next($request);
    }
}
