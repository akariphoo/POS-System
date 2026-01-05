<?php

namespace App\Http\Controllers\Capital;

use App\Http\Controllers\BaseController;
use App\Models\Capital;
use App\Http\Resources\Capital\CapitalListResource;
use Illuminate\Http\Request;

class CapitalController extends BaseController
{
    public function index()
    {
        $capitals = Capital::with('currency')->get();
        return $this->handleServiceResponse([
            true,
            'Capitals retrieved successfully',
            CapitalListResource::collection($capitals),
            200
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'currency_id' => 'required|exists:currencies,id',
            'initial_capital_amount' => 'required|numeric|min:0',
        ]);

        // On creation, initial and remaining are usually the same
        $capital = Capital::create([
            'currency_id' => $validated['currency_id'],
            'initial_capital_amount' => $validated['initial_capital_amount'],
            'remaining_capital_amount' => $validated['initial_capital_amount'],
        ]);

        return $this->handleServiceResponse([true, 'Capital added', new CapitalListResource($capital), 201]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:capitals,id',
            'initial_capital_amount' => 'required|numeric|min:0',
            'remaining_capital_amount' => 'required|numeric|min:0',
        ]);

        $capital = Capital::findOrFail($request->id);
        $capital->update($request->all());

        return $this->handleServiceResponse([true, 'Capital updated', new CapitalListResource($capital), 200]);
    }

    public function destroy(Request $request)
    {
        Capital::findOrFail($request->id)->delete();
        return $this->handleServiceResponse([true, 'Capital deleted', null, 200]);
    }
}
