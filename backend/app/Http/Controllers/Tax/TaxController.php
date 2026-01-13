<?php

namespace App\Http\Controllers\Tax;

use App\Http\Controllers\BaseController;
use App\Models\Tax;
use App\Models\TaxHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaxController extends BaseController
{
    public function index()
    {
        // Load taxes with their current snapshot from history
        $taxes = Tax::with(['history'])->get();

        // Load full history for the log
        $allHistory = TaxHistory::orderBy('created_at', 'desc')->limit(20)->get();

        return $this->handleServiceResponse([
            true,
            'Success',
            ['taxes' => $taxes, 'all_history' => $allHistory],
            200
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tax_name' => 'required|string|max:50',
            'tax_rate' => 'required|numeric',
            'effective_from' => 'required|date'
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Create the history record (The actual data)
            $history = TaxHistory::create([
                'user_id' => Auth::id() ?? 1, // Fallback for dev
                'tax_name' => $request->tax_name,
                'tax_rate' => $request->tax_rate,
                'status' => 'active',
                'effective_from' => $request->effective_from,
            ]);

            // 2. Create the tax pointer
            $tax = Tax::create(['tax_history_id' => $history->id]);

            return $this->handleServiceResponse([true, 'Tax Created', $tax, 201]);
        });
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'tax_name' => 'required|string|max:50',
            'tax_rate' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive'
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $tax = Tax::findOrFail($id);
            $timestamp = now();

            // 1. Close the PREVIOUS history record
            // We set effective_to to the exact same second the new one starts
            TaxHistory::where('id', $tax->tax_history_id)
                ->update([
                    'effective_to' => $timestamp,
                    'status' => 'inactive' // The old version is no longer the "current" active one
                ]);

            // 2. Create the NEW history record
            $newHistory = TaxHistory::create([
                'user_id' => auth()->id() ?? 1,
                'tax_name' => $validated['tax_name'],
                'tax_rate' => $validated['tax_rate'],
                'status' => $validated['status'],
                'effective_from' => $timestamp, // Starts now
                'effective_to' => null,         // Stays null until the NEXT edit
            ]);

            // 3. Update the main Tax pointer to the new history ID
            $tax->update([
                'tax_history_id' => $newHistory->id
            ]);

            return $this->handleServiceResponse([
                true,
                'Tax version updated successfully',
                $tax->load('history'),
                200
            ]);
        });
    }

    public function destroy($id)
    {
        Tax::findOrFail($id)->delete();
        return $this->handleServiceResponse([true, 'Tax deleted', null, 200]);
    }
}
