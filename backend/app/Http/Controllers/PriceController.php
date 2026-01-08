<?php

namespace App\Http\Controllers;

use App\Models\Price;
use App\Models\RolePriceAccess;
use App\Services\Pricing\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceController extends Controller
{
    public function __construct(
        private PricingService $pricingService
    ) {
    }

    /**
     * List all prices (admin view)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Price::with(['product', 'roleAccess.role'])
            ->orderBy('product_id')
            ->orderBy('price');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $prices = $query->get();

        return response()->json([
            'success' => true,
            'data' => $prices,
        ]);
    }

    /**
     * Get available prices for current user (for sales form)
     */
    public function available(Request $request): JsonResponse
    {
        $request->validate([
            'channel' => ['required', 'in:FACTORY,FIELD'],
            'product_id' => ['nullable', 'uuid', 'exists:products,id'],
        ]);

        $user = auth()->user();
        $prices = $this->pricingService->getAvailablePrices(
            $user,
            $request->channel,
            $request->product_id
        );

        return response()->json([
            'success' => true,
            'data' => $prices,
        ]);
    }

    /**
     * Create new price
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'sales_channel' => ['required', 'in:FACTORY,FIELD,ALL'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['uuid', 'exists:roles,id'],
        ]);

        $price = Price::create([
            'product_id' => $request->product_id,
            'price' => $request->price,
            'sales_channel' => $request->sales_channel,
            'valid_from' => $request->valid_from ?? now(),
            'valid_until' => $request->valid_until,
        ]);

        // Assign role access
        foreach ($request->role_ids as $roleId) {
            RolePriceAccess::create([
                'role_id' => $roleId,
                'price_id' => $price->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Harga berhasil ditambahkan',
            'data' => $price->load(['product', 'roleAccess.role']),
        ], 201);
    }

    /**
     * Update price
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $price = Price::findOrFail($id);

        $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'valid_until' => ['nullable', 'date'],
            'role_ids' => ['sometimes', 'array'],
            'role_ids.*' => ['uuid', 'exists:roles,id'],
        ]);

        $price->update($request->only(['is_active', 'valid_until']));

        if ($request->has('role_ids')) {
            // Update role access
            RolePriceAccess::where('price_id', $price->id)->delete();
            foreach ($request->role_ids as $roleId) {
                RolePriceAccess::create([
                    'role_id' => $roleId,
                    'price_id' => $price->id,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Harga berhasil diupdate',
            'data' => $price->fresh(['product', 'roleAccess.role']),
        ]);
    }

    /**
     * Delete price
     */
    public function destroy(string $id): JsonResponse
    {
        $price = Price::findOrFail($id);

        // Delete role access first
        RolePriceAccess::where('price_id', $price->id)->delete();

        $price->delete();

        return response()->json([
            'success' => true,
            'message' => 'Harga berhasil dihapus',
        ]);
    }
}
