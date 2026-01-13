<?php

namespace App\Http\Controllers\ExpenseCategory;

use App\Http\Controllers\BaseController;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends BaseController
{
    public function index()
    {
        $categories = ExpenseCategory::orderBy('name', 'asc')->get();
        return $this->handleServiceResponse([
            true,
            'Categories retrieved successfully',
            $categories,
            200
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:expense_categories,name',
            'description' => 'nullable|string|max:255'
        ]);

        $category = ExpenseCategory::create($validated);

        return $this->handleServiceResponse([
            true,
            'Category created successfully',
            $category,
            201
        ]);
    }

    public function update(Request $request, $id) // ID comes from URL
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:expense_categories,name,' . $id,
            'description' => 'nullable|string|max:255'
        ]);

        $category = ExpenseCategory::findOrFail($id);
        $category->update($validated);

        return $this->handleServiceResponse([
            true,
            'Category updated successfully',
            $category,
            200
        ]);
    }


    public function destroy($id) // ID comes from URL
    {
        $category = ExpenseCategory::findOrFail($id);
        $category->delete();

        return $this->handleServiceResponse([
            true,
            'Category deleted successfully',
            null,
            200
        ]);
    }
}
