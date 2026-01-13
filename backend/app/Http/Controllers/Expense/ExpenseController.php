<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\BaseController;
use App\Models\Currency;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ExpenseCurrency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends BaseController
{
    public function index(Request $request)
    {
        // 1. Fetch Expenses with limited columns for speed
        $expenses = Expense::with([
            'category:id,name',
            'expenseCurrencies.currency:id,name'
        ])
            ->orderBy('date', 'desc')
            ->paginate(15);

        // 2. Prepare the final response data
        $responseData = [
            'expenses' => $expenses
        ];

        // 3. Only include Meta if requested (e.g., on first page load)
        if ($request->has('include_meta')) {
            $responseData['meta'] = [
                'categories' => ExpenseCategory::select('id', 'name')->get(),
                'currencies' => Currency::select('id', 'name')->get(),
            ];
        }

        return $this->handleServiceResponse([
            true,
            'Data retrieved successfully',
            $responseData,
            200
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'description' => 'nullable|string|max:255',
            'amounts' => 'required|array', // Expecting [{currency_id: 1, amount: 100}, ...]
            'amounts.*.currency_id' => 'required|exists:currencies,id',
            'amounts.*.amount' => 'required|numeric|min:0'
        ]);

        return DB::transaction(function () use ($request) {
            $expense = Expense::create($request->only(['date', 'expense_category_id', 'description']));

            foreach ($request->amounts as $amt) {
                ExpenseCurrency::create([
                    'expense_id' => $expense->id,
                    'currency_id' => $amt['currency_id'],
                    'amount' => $amt['amount']
                ]);
            }

            return $this->handleServiceResponse([true, 'Expense recorded', $expense->load('expenseCurrencies'), 201]);
        });
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'description' => 'nullable|string|max:255',
            'amounts' => 'required|array',
            'amounts.*.currency_id' => 'required|exists:currencies,id',
            'amounts.*.amount' => 'required|numeric|min:0'
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $expense = Expense::findOrFail($id);

            // 1. Update the main expense record
            $expense->update([
                'date' => $validated['date'],
                'expense_category_id' => $validated['expense_category_id'],
                'description' => $validated['description']
            ]);

            // 2. Remove old currency entries
            ExpenseCurrency::where('expense_id', $id)->delete();

            // 3. Prepare and Insert new currency entries (Bulk Insert for performance)
            $currencyData = collect($validated['amounts'])
                ->filter(fn($item) => $item['amount'] > 0) // Only save non-zero amounts
                ->map(fn($item) => [
                    'expense_id' => $id,
                    'currency_id' => $item['currency_id'],
                    'amount' => $item['amount'],
                    'created_at' => now(),
                    'updated_at' => now()
                ])->toArray();

            if (!empty($currencyData)) {
                ExpenseCurrency::insert($currencyData);
            }

            return $this->handleServiceResponse([
                true,
                'Expense updated successfully',
                null,
                200
            ]);
        });
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return $this->handleServiceResponse([true, 'Expense deleted', null, 200]);
    }
}
