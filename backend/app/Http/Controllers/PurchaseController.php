<?php

namespace App\Http\Controllers;

use App\Services\Purchase\PurchaseService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(
        protected PurchaseService $purchaseService
    ) {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'per_page']);
        $purchases = $this->purchaseService->getAll($filters);

        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'nullable|string|max:255',
            'purchased_at' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.supply_id' => 'required|uuid|exists:supplies,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price_per_unit' => 'required|numeric|min:0',
        ]);

        $purchase = $this->purchaseService->create(
            $validated,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Pembelian berhasil dicatat',
            'data' => $purchase,
        ], 201);
    }

    public function show(string $id)
    {
        $purchase = \App\Models\Purchase::with(['items.supply', 'createdBy'])
            ->findOrFail($id);

        return response()->json($purchase);
    }

    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $total = $this->purchaseService->getTotalByDateRange(
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_purchases' => $total,
        ]);
    }
}
