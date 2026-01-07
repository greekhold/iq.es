<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        private InventoryService $inventoryService
    ) {
    }

    /**
     * Get current stock for all products
     */
    public function stock(): JsonResponse
    {
        $stocks = $this->inventoryService->getAllStock();

        return response()->json([
            'success' => true,
            'data' => array_values($stocks),
        ]);
    }

    /**
     * Get movement history
     */
    public function movements(Request $request): JsonResponse
    {
        $query = \App\Models\InventoryMovement::with(['product', 'createdBy'])
            ->orderBy('created_at', 'desc');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->has('type')) {
            $query->where('movement_type', $request->type);
        }

        $movements = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $movements,
        ]);
    }

    /**
     * Manual stock adjustment (admin only)
     */
    public function adjustment(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'quantity' => ['required', 'integer'],
            'notes' => ['nullable', 'string'],
        ]);

        $user = auth()->user();
        $product = Product::findOrFail($request->product_id);

        $movement = $this->inventoryService->recordMovement(
            $product,
            \App\Enums\MovementType::ADJUSTMENT,
            $request->quantity,
            $user
        );

        return response()->json([
            'success' => true,
            'message' => 'Penyesuaian stok berhasil',
            'data' => $movement,
        ]);
    }
}
