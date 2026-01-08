<?php

namespace App\Http\Controllers;

use App\Models\Supply;
use App\Services\Supply\SupplyService;
use Illuminate\Http\Request;

class SupplyController extends Controller
{
    public function __construct(
        protected SupplyService $supplyService
    ) {
    }

    public function index(Request $request)
    {
        $query = Supply::query();

        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $supplies = $query->orderBy('name')->get();

        return response()->json($supplies);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:supplies,sku',
            'unit' => 'required|string|max:50',
            'min_stock' => 'integer|min:0',
            'linked_product_id' => 'nullable|uuid|exists:products,id',
            'deduct_per_sale' => 'integer|min:1',
        ]);

        $supply = Supply::create($validated);

        return response()->json($supply, 201);
    }

    public function update(Request $request, Supply $supply)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'unit' => 'string|max:50',
            'min_stock' => 'integer|min:0',
            'linked_product_id' => 'nullable|uuid|exists:products,id',
            'deduct_per_sale' => 'integer|min:1',
            'is_active' => 'boolean',
        ]);

        $supply->update($validated);

        return response()->json($supply);
    }

    public function adjust(Request $request, Supply $supply)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer',
        ]);

        $movement = $this->supplyService->adjustStock(
            $supply->id,
            $validated['quantity'],
            $request->user()->id
        );

        return response()->json([
            'message' => 'Stok berhasil disesuaikan',
            'movement' => $movement,
            'new_stock' => $supply->fresh()->current_stock,
        ]);
    }

    public function lowStock()
    {
        $supplies = $this->supplyService->getLowStockSupplies();

        return response()->json($supplies);
    }

    public function destroy(Supply $supply)
    {
        // Check if supply has movements
        if ($supply->movements()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Bahan tidak dapat dihapus karena memiliki riwayat pergerakan stok',
            ], 422);
        }

        $supply->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bahan berhasil dihapus',
        ]);
    }
}
