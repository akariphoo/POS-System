<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\BaseController;
use App\Models\Capital;
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
            'amounts' => 'required|array',
            'amounts.*.currency_id' => 'required|exists:currencies,id',
            'amounts.*.amount' => 'required|numeric|min:0'
        ]);
        try {
            return DB::transaction(function () use ($request) {
                $expense = Expense::create($request->only(['date', 'expense_category_id', 'description']));

                foreach ($request->amounts as $amt) {
                    // Deduct from Capital FIRST or check balance
                    $capital = Capital::where('currency_id', $amt['currency_id'])->lockForUpdate()->first();

                    if (!$capital) {
                        // THROW an exception to force Rollback
                        throw new \Exception("No capital found for currency ID: {$amt['currency_id']}");
                    }

                    if ($capital->remaining_capital_amount < $amt['amount']) {
                        // THROW an exception to force Rollback
                        throw new \Exception("Not enough capital in {$capital->currency->name}");
                    }

                    $capital->remaining_capital_amount -= $amt['amount'];
                    $capital->save();

                    ExpenseCurrency::create([
                        'expense_id' => $expense->id,
                        'currency_id' => $amt['currency_id'],
                        'amount' => $amt['amount']
                    ]);
                }

                return $this->handleServiceResponse([true, 'Expense recorded', $expense->load('expenseCurrencies'), 201]);
            });
        } catch (\Exception $e) {
            // Return the error message to the frontend
            return $this->handleServiceResponse([false, $e->getMessage(), null, 400]);
        }
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

        try {
            return DB::transaction(function () use ($validated, $id) {

                $expense = Expense::with('expenseCurrencies')->findOrFail($id);

                /** ------------------------------------------------
                 * STEP 1: REFUND OLD AMOUNTS BACK TO CAPITAL
                 * ------------------------------------------------*/
                foreach ($expense->expenseCurrencies as $old) {
                    $capital = Capital::where('currency_id', $old->currency_id)
                        ->lockForUpdate()
                        ->first();

                    if ($capital) {
                        $capital->remaining_capital_amount += $old->amount;
                        $capital->save();
                    }
                }

                /** ------------------------------------------------
                 * STEP 2: UPDATE MAIN EXPENSE INFO
                 * ------------------------------------------------*/
                $expense->update([
                    'date' => $validated['date'],
                    'expense_category_id' => $validated['expense_category_id'],
                    'description' => $validated['description']
                ]);

                /** ------------------------------------------------
                 * STEP 3: DELETE OLD BREAKDOWN
                 * ------------------------------------------------*/
                ExpenseCurrency::where('expense_id', $id)->delete();

                /** ------------------------------------------------
                 * STEP 4: DEDUCT NEW AMOUNTS FROM CAPITAL
                 * ------------------------------------------------*/
                $currencyData = [];

                foreach ($validated['amounts'] as $item) {
                    if ($item['amount'] <= 0) continue;

                    $capital = Capital::where('currency_id', $item['currency_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$capital) {
                        throw new \Exception("No capital found for selected currency");
                    }

                    if ($capital->remaining_capital_amount < $item['amount']) {
                        throw new \Exception("Not enough capital in " . $capital->currency->name);
                    }

                    $capital->remaining_capital_amount -= $item['amount'];
                    $capital->save();

                    $currencyData[] = [
                        'expense_id' => $id,
                        'currency_id' => $item['currency_id'],
                        'amount' => $item['amount'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }

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
        } catch (\Exception $e) {
            return $this->handleServiceResponse([false, $e->getMessage(), null, 400]);
        }
    }

    public function destroy($id)
    {
        try {
            return DB::transaction(function () use ($id) {

                $expense = Expense::with('expenseCurrencies')->findOrFail($id);

                /** ------------------------------------------------
                 * STEP 1: REFUND ALL AMOUNTS BACK TO CAPITAL
                 * ------------------------------------------------*/
                foreach ($expense->expenseCurrencies as $old) {
                    $capital = Capital::where('currency_id', $old->currency_id)
                        ->lockForUpdate()
                        ->first();

                    if ($capital) {
                        $capital->remaining_capital_amount += $old->amount;
                        $capital->save();
                    }
                }

                /** ------------------------------------------------
                 * STEP 2: DELETE EXPENSE
                 * ------------------------------------------------*/
                $expense->expenseCurrencies()->delete();
                $expense->delete();

                return $this->handleServiceResponse([true, 'Expense deleted and capital refunded', null, 200]);
            });
        } catch (\Exception $e) {
            return $this->handleServiceResponse([false, $e->getMessage(), null, 400]);
        }
    }
}
