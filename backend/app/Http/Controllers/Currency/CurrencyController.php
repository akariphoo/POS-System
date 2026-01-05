<?php

namespace App\Http\Controllers\Currency;

use App\Http\Controllers\BaseController;
use App\Models\Currency;
use App\Http\Resources\Currency\CurrencyListResource;
use Illuminate\Http\Request;

class CurrencyController extends BaseController
{
    public function index()
    {
        $currencies = Currency::all();

        return $this->handleServiceResponse([
            true,
            'Currencies retrieved successfully',
            CurrencyListResource::collection($currencies),
            200
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|size:3|unique:currencies,name'
        ]);

        $currency = Currency::create([
            'name' => strtoupper($validated['name'])
        ]);

        return $this->handleServiceResponse([
            true,
            'Currency created successfully',
            new CurrencyListResource($currency),
            201
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:currencies,id',
            'name' => 'required|string|size:3|unique:currencies,name,' . $request->id
        ]);

        $currency = Currency::findOrFail($request->id);
        $currency->update(['name' => strtoupper($request->name)]);

        return $this->handleServiceResponse([
            true,
            'Currency updated successfully',
            new CurrencyListResource($currency),
            200
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['id' => 'required|exists:currencies,id']);

        $currency = Currency::findOrFail($request->id);
        $currency->delete();

        return $this->handleServiceResponse([
            true,
            'Currency deleted successfully',
            null,
            200
        ]);
    }
}
