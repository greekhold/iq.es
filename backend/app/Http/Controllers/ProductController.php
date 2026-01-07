<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List all products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->orderBy('name');

        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $products = $query->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'weight_kg' => $product->weight_kg,
                'status' => $product->status,
                'current_stock' => $product->getCurrentStock(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Create new product
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'weight_kg' => ['required', 'numeric', 'min:0.01'],
        ]);

        $product = Product::create($request->only(['name', 'sku', 'weight_kg']));

        AuditLog::log('CREATE', Product::class, $product->id, null, $product->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan',
            'data' => $product,
        ], 201);
    }

    /**
     * Update product
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $oldData = $product->toArray();

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'sku' => ['sometimes', 'string', 'max:50', 'unique:products,sku,' . $id],
            'weight_kg' => ['sometimes', 'numeric', 'min:0.01'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $product->update($request->only(['name', 'sku', 'weight_kg', 'status']));

        AuditLog::log('UPDATE', Product::class, $product->id, $oldData, $product->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diupdate',
            'data' => $product,
        ]);
    }
}
