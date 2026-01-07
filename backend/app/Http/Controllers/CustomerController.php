<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * List customers
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()->orderBy('name');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $customers = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Create new customer
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:customers,phone'],
            'type' => ['required', 'in:RETAIL,AGEN,RESELLER'],
            'address' => ['nullable', 'string'],
        ]);

        $customer = Customer::create($request->only(['name', 'phone', 'type', 'address']));

        AuditLog::log('CREATE', Customer::class, $customer->id, null, $customer->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil ditambahkan',
            'data' => $customer,
        ], 201);
    }

    /**
     * Update customer
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);
        $oldData = $customer->toArray();

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:customers,phone,' . $id],
            'type' => ['sometimes', 'in:RETAIL,AGEN,RESELLER'],
            'address' => ['nullable', 'string'],
        ]);

        $customer->update($request->only(['name', 'phone', 'type', 'address']));

        AuditLog::log('UPDATE', Customer::class, $customer->id, $oldData, $customer->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil diupdate',
            'data' => $customer,
        ]);
    }

    /**
     * Get customer purchase history
     */
    public function history(string $id): JsonResponse
    {
        $customer = Customer::with([
            'sales' => function ($q) {
                $q->with(['items.product', 'createdBy'])
                    ->orderBy('sold_at', 'desc')
                    ->limit(50);
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => $customer,
                'total_purchases' => $customer->total_purchases,
                'purchase_count' => $customer->purchase_count,
            ],
        ]);
    }
}
