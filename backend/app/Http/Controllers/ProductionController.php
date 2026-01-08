<?php

namespace App\Http\Controllers;

use App\Http\Requests\Production\CreateProductionRequest;
use App\Models\ProductionRecord;
use App\Services\Production\ProductionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function __construct(
        private ProductionService $productionService
    ) {
    }

    /**
     * List production records
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProductionRecord::with(['product', 'createdBy'])
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

        $records = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }

    /**
     * Record new production
     */
    public function store(CreateProductionRequest $request): JsonResponse
    {
        $user = auth()->user();

        $record = $this->productionService->recordProduction(
            $user,
            $request->product_id,
            $request->quantity,
            $request->machine_on_at,
            $request->machine_off_at,
            $request->notes
        );

        return response()->json([
            'success' => true,
            'message' => 'Produksi berhasil dicatat',
            'data' => $record,
        ], 201);
    }

    /**
     * Get production summary
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $summary = $this->productionService->getProductionSummary(
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Delete production record
     */
    public function destroy(string $id): JsonResponse
    {
        $record = ProductionRecord::findOrFail($id);

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produksi berhasil dihapus',
        ]);
    }
}
