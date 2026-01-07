<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {
    }

    /**
     * Login user and generate tokens
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->email,
            $request->password
        );

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => $result,
        ]);
    }

    /**
     * Refresh access token
     */
    public function refresh(): JsonResponse
    {
        try {
            $result = $this->authService->refresh();

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal refresh token',
            ], 401);
        }
    }

    /**
     * Logout user
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get current user info
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}
