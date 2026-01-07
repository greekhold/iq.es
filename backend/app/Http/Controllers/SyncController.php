<?php

namespace App\Http\Controllers;

use App\Models\SyncQueue;
use App\Services\Sync\SyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function __construct(
        private SyncService $syncService
    ) {
    }

    /**
     * Push offline transactions
     */
    public function push(Request $request): JsonResponse
    {
        $request->validate([
            'transactions' => ['required', 'array', 'min:1'],
            'transactions.*.local_id' => ['required', 'string'],
            'transactions.*.items' => ['required', 'array', 'min:1'],
            'transactions.*.payment_method' => ['required', 'in:CASH,TRANSFER'],
        ]);

        $user = auth()->user();
        $results = $this->syncService->pushTransactions(
            $request->transactions,
            $user
        );

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    /**
     * Get sync status for user
     */
    public function status(): JsonResponse
    {
        $user = auth()->user();

        $pending = SyncQueue::where('user_id', $user->id)
            ->pending()
            ->count();

        $conflicts = SyncQueue::where('user_id', $user->id)
            ->conflict()
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'conflicts' => $conflicts,
            ],
        ]);
    }

    /**
     * Get conflicts for admin review
     */
    public function conflicts(): JsonResponse
    {
        $conflicts = $this->syncService->getConflicts();

        return response()->json([
            'success' => true,
            'data' => $conflicts,
        ]);
    }

    /**
     * Resolve a conflict
     */
    public function resolve(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'resolution' => ['required', 'in:approve,reject'],
        ]);

        $syncEntry = SyncQueue::findOrFail($id);
        $user = auth()->user();

        $result = $this->syncService->resolveConflict(
            $syncEntry,
            $request->resolution,
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'Konflik berhasil diselesaikan',
            'data' => $result,
        ]);
    }
}
