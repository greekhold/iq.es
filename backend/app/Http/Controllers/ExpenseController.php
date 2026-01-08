<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use App\Services\Expense\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService
    ) {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['category_id', 'start_date', 'end_date', 'per_page']);
        $expenses = $this->expenseService->getAll($filters);

        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|uuid|exists:expense_categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $expense = $this->expenseService->create(
            $validated,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengeluaran berhasil dicatat',
            'data' => $expense->load('category'),
        ], 201);
    }

    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $total = $this->expenseService->getTotalByDateRange(
            $request->start_date,
            $request->end_date
        );

        $byCategory = $this->expenseService->getTotalByCategory(
            $request->start_date,
            $request->end_date
        );

        return response()->json([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_expenses' => $total,
            'by_category' => $byCategory,
        ]);
    }

    public function categories()
    {
        $categories = $this->expenseService->getCategories();

        return response()->json($categories);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
        ]);

        $category = ExpenseCategory::create($validated);

        return response()->json($category, 201);
    }

    public function update(Request $request, string $id)
    {
        $expense = \App\Models\Expense::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|uuid|exists:expense_categories,id',
            'description' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'expense_date' => 'sometimes|date',
            'notes' => 'nullable|string',
        ]);

        $expense->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengeluaran berhasil diupdate',
            'data' => $expense->load('category'),
        ]);
    }

    public function destroy(string $id)
    {
        $expense = \App\Models\Expense::findOrFail($id);

        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengeluaran berhasil dihapus',
        ]);
    }
}
