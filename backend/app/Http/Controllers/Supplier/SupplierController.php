<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\BaseController;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SupplierController extends BaseController
{
    // GET /api/suppliers
    public function index()
    {
        $suppliers = Supplier::latest()->get();

        return $this->handleServiceResponse([
            true,
            'Suppliers retrieved successfully',
            $suppliers,
            200
        ]);
    }

    // POST /api/suppliers
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:100|unique:suppliers,supplier_name',
            'contact_name' => 'nullable|string|max:100',
            'phone' => 'nullable|regex:/^\+?[0-9]{7,15}$/',
            'email' => 'nullable|email|max:100'
        ]);

        $supplier = Supplier::create($validated);

        return $this->handleServiceResponse([
            true,
            'Supplier created successfully',
            $supplier,
            201
        ]);
    }

    // PUT /api/suppliers/{id}
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'supplier_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('suppliers', 'supplier_name')->ignore($supplier->id),
            ],
            'contact_name' => 'nullable|string|max:100',
            'phone' => 'nullable|regex:/^\+?[0-9]{7,15}$/',
            'email' => 'nullable|email|max:100'
        ]);

        $supplier->update($validated);

        return $this->handleServiceResponse([
            true,
            'Supplier updated successfully',
            $supplier,
            200
        ]);
    }

    // DELETE /api/suppliers/{id}
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return $this->handleServiceResponse([
            true,
            'Supplier deleted successfully',
            null,
            200
        ]);
    }
}
