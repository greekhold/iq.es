<?php

namespace App\Http\Controllers;

use App\Enums\SalesChannel;
use App\Http\Requests\Sales\CreateSaleRequest;
use App\Models\Sale;
use App\Services\Sales\SalesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesController extends Controller
{
    public function __construct(
        private SalesService $salesService
    ) {
    }

    /**
     * List sales with filters
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = Sale::with(['customer', 'createdBy', 'items.product'])
            ->orderBy('sold_at', 'desc');

        // Non-admin users can only see their own sales
        if (!$user->isAdmin()) {
            $query->where('created_by', $user->id);
        }

        // Apply filters
        if ($request->has('channel')) {
            $query->where('sales_channel', $request->channel);
        }

        if ($request->has('start_date')) {
            $query->whereDate('sold_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('sold_at', '<=', $request->end_date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sales = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }

    /**
     * Create a new sale
     */
    public function store(CreateSaleRequest $request): JsonResponse
    {
        $user = auth()->user();
        $channel = SalesChannel::from($request->sales_channel);

        // Validate user can access this channel
        if (!$user->role || !in_array($user->role->name, ['OWNER', 'ADMIN'])) {
            if ($user->role?->name === 'KASIR_PABRIK' && $channel !== SalesChannel::FACTORY) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kasir hanya bisa melakukan penjualan pabrik',
                ], 403);
            }
            if ($user->role?->name === 'SUPPLIER' && $channel !== SalesChannel::FIELD) {
                return response()->json([
                    'success' => false,
                    'message' => 'Supplier hanya bisa melakukan penjualan lapangan',
                ], 403);
            }
        }

        try {
            $sale = $this->salesService->createSale(
                $user,
                $channel,
                $request->items,
                $request->payment_method,
                $request->customer_id,
                $request->sold_at,
                $request->due_date,
                $request->boolean('is_new_galon', false)
            );

            return response()->json([
                'success' => true,
                'message' => 'Penjualan berhasil dicatat',
                'data' => $sale,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }


    /**
     * Get sale detail
     */
    public function show(string $id): JsonResponse
    {
        $sale = Sale::with(['customer', 'createdBy', 'items.product', 'items.price'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $sale,
        ]);
    }

    /**
     * Cancel a sale
     */
    public function cancel(string $id): JsonResponse
    {
        $sale = Sale::findOrFail($id);
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang bisa membatalkan penjualan',
            ], 403);
        }

        try {
            $sale = $this->salesService->cancelSale($sale, $user);

            return response()->json([
                'success' => true,
                'message' => 'Penjualan berhasil dibatalkan',
                'data' => $sale,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Mark a sale as paid
     */
    public function markAsPaid(string $id): JsonResponse
    {
        $sale = Sale::findOrFail($id);
        $user = auth()->user();

        try {
            $sale = $this->salesService->markAsPaid($sale, $user);

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran berhasil dicatat',
                'data' => $sale,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update a sale
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $sale = Sale::findOrFail($id);

        $request->validate([
            'notes' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
        ]);

        $sale->update($request->only(['notes', 'due_date']));

        return response()->json([
            'success' => true,
            'message' => 'Penjualan berhasil diupdate',
            'data' => $sale->fresh(['customer', 'items.product']),
        ]);
    }

    /**
     * Delete a sale
     */
    public function destroy(string $id): JsonResponse
    {
        $sale = Sale::findOrFail($id);

        // Delete items
        $sale->items()->delete();
        $sale->delete();

        return response()->json([
            'success' => true,
            'message' => 'Penjualan berhasil dihapus',
        ]);
    }
}
