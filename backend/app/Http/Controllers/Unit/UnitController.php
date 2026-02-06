<?php

namespace App\Http\Controllers\Unit;

use App\Http\Controllers\BaseController;
use App\Http\Resources\Unit\UnitListResource;
use App\Models\Unit;
use App\Http\Resources\Unit\UnitResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UnitController extends BaseController
{
    // GET /api/units
    public function index()
    {
        $units = Unit::latest()->get();

        return $this->handleServiceResponse([
            true,
            'Unit list retrieved successfully',
            UnitListResource::collection($units),
            200
        ]);
    }

    // POST /api/units
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:units,code',
            'name' => 'required|string|max:50',
            'type' => ['required', Rule::in(['solid','liquid','gas','special'])],
            'is_active' => 'boolean'
        ]);

        $unit = Unit::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'is_active' => $validated['is_active'] ?? true
        ]);

        return $this->handleServiceResponse([
            true,
            'Unit created successfully',
            new UnitListResource($unit),
            201
        ]);
    }

    // PUT /api/units/{id}
    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('units', 'code')->ignore($unit->id)
            ],
            'name' => 'required|string|max:50',
            'type' => ['required', Rule::in(['solid','liquid','gas','special'])],
            'is_active' => 'boolean'
        ]);

        $unit->update([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'is_active' => $validated['is_active'] ?? $unit->is_active
        ]);

        return $this->handleServiceResponse([
            true,
            'Unit updated successfully',
            new UnitListResource($unit),
            200
        ]);
    }

    // DELETE /api/units/{id}
    public function destroy($id)
    {
        $unit = Unit::findOrFail($id);
        $unit->delete();

        return $this->handleServiceResponse([
            true,
            'Unit deleted successfully',
            null,
            200
        ]);
    }
}
