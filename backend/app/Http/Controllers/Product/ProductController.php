<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\BaseController;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends BaseController
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                    ->orWhere('sku', 'LIKE', "%$search%")
                    ->orWhere('barcode', 'LIKE', "%$search%");
            });
        }

        $products = $query->latest()->paginate(10);
        return $this->handleServiceResponse([true, 'Products retrieved successfully', $products, 200]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'sku'         => 'nullable|string|max:50',
            'barcode'     => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image'] = $path;
        }

        $product = Product::create($data);

        return $this->handleServiceResponse([true, 'Product created successfully', $product, 201]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'sku'         => 'nullable|string|max:50',
            'barcode'     => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
            'image'       => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return $this->handleServiceResponse([true, 'Product updated successfully', $product, 200]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->delete();

        return $this->handleServiceResponse([true, 'Product deleted successfully', null, 200]);
    }
}
