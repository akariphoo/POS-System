<?php

namespace App\Http\Controllers\ExchangeRate;

use App\Http\Controllers\BaseController;
use App\Http\Requests\ExchangeRate\ExchangeRateStoreRequest;
use App\Models\ExchangeRateHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExchangeRateController extends BaseController
{
    public function index()
    {
        $data = ExchangeRateHistory::with('user')->latest()->get();
        return $this->handleServiceResponse([true, 'Exchange history list', $data, 200]);
    }

    public function store(ExchangeRateStoreRequest $request)
    {
        $request->validated();

        DB::beginTransaction();
        try {
            $base = strtoupper($request->base_currency);
            $quote = strtoupper($request->quote_currency);
            $effectiveFrom = $request->effective_from;

            // 1. Logic for Active Rates
            if ($request->status === 'active') {
                // Automatically "Close" the previous active rate for this specific pair
                // This prevents overlapping valid dates in your history
                ExchangeRateHistory::where('base_currency', $base)
                    ->where('quote_currency', $quote)
                    ->where('status', 'active')
                    ->update([
                        'status'       => 'inactive',
                        'effective_to' => $effectiveFrom // Old rate ends when new one starts
                    ]);
            }

            // 2. Create the New History Record
            $history = ExchangeRateHistory::create([
                'user_id'        => auth()->id(),
                'base_currency'  => $base,
                'quote_currency' => $quote,
                'rate'           => $request->rate,
                'status'         => $request->status,
                'effective_from' => $effectiveFrom,
                'effective_to'   => $request->effective_to, // Manually set or NULL
            ]);

            // 3. Update the Pointer (CurrentExchangeRate)
            // This table should only point to the absolute latest 'active' rate
            if ($history->status === 'active') {
                DB::table('current_exchange_rates')->updateOrInsert(
                    // Assuming you handle one main rate, or filter by currency pair ID
                    ['id' => 1],
                    [
                        'exchange_rate_history_id' => $history->id,
                        'updated_at' => now()
                    ]
                );
            }

            DB::commit();

            return $this->handleServiceResponse([
                true,
                'Exchange rate history recorded successfully',
                $history,
                201
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return $this->handleServiceResponse([
                false,
                'Failed to record exchange rate: ' . $e->getMessage(),
                null,
                500
            ]);
        }
    }
    public function destroy($id)
    {
        $history = ExchangeRateHistory::findOrFail($id);
        $history->delete();
        return $this->handleServiceResponse([true, 'Record deleted', null, 200]);
    }
}
