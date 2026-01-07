<?php

namespace App\Services\Expense;

use App\Models\Expense;
use App\Models\ExpenseCategory;

class ExpenseService
{
    public function create(array $data, string $userId): Expense
    {
        return Expense::create([
            'category_id' => $data['category_id'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'expense_date' => $data['expense_date'] ?? now(),
            'notes' => $data['notes'] ?? null,
            'created_by' => $userId,
        ]);
    }

    public function getAll(array $filters = [])
    {
        $query = Expense::with(['category', 'createdBy'])
            ->orderBy('expense_date', 'desc');

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['start_date'])) {
            $query->whereDate('expense_date', '>=', $filters['start_date']);
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('expense_date', '<=', $filters['end_date']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getTotalByDateRange(string $startDate, string $endDate): float
    {
        return Expense::whereDate('expense_date', '>=', $startDate)
            ->whereDate('expense_date', '<=', $endDate)
            ->sum('amount');
    }

    public function getTotalByCategory(string $startDate, string $endDate): array
    {
        return Expense::whereDate('expense_date', '>=', $startDate)
            ->whereDate('expense_date', '<=', $endDate)
            ->with('category')
            ->get()
            ->groupBy('category_id')
            ->map(function ($expenses) {
                return [
                    'category' => $expenses->first()->category,
                    'total' => $expenses->sum('amount'),
                    'count' => $expenses->count(),
                ];
            })
            ->values()
            ->toArray();
    }

    public function getCategories()
    {
        return ExpenseCategory::active()->get();
    }
}
