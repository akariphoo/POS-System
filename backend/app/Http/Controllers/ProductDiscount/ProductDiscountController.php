<?php
// App/Http/Controllers/ProductDiscount/ProductDiscountController.php

namespace App\Http\Controllers\ProductDiscount;

use App\Http\Controllers\BaseController;
use App\Models\Discount;
use App\Models\Product;
use App\Models\ProductDiscount;
use Illuminate\Http\Request;

class ProductDiscountController extends BaseController
{
    public function formData()
    {
        return response()->json([
            'products' => Product::select('id', 'name')->get(),
            'discounts' => Discount::select('id', 'name', 'discount_type', 'value', 'buy_quantity', 'get_quantity')->get(),
            'product_discounts' => ProductDiscount::with([
                'product:id,name',
                'discount:id,name,discount_type,value,buy_quantity,get_quantity'
            ])->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'discount_id'  => 'required|exists:discounts,id',
            'usage_type'   => 'required|in:date,usage_limit',
            'start_date'   => 'nullable|required_if:usage_type,date|date',
            'end_date'     => 'nullable|required_if:usage_type,date|date|after_or_equal:start_date',
            'usage_limit'  => 'nullable|required_if:usage_type,usage_limit|integer|min:1',
            'status'       => 'required|in:active,inactive'
        ]);

        if ($data['usage_type'] === 'date') {
            $data['usage_limit'] = null;
            $data['remaining_usage_limit'] = null;
        } else {
            $data['remaining_usage_limit'] = $data['usage_limit'];
            $data['start_date'] = null;
            $data['end_date'] = null;
        }

        $pd = ProductDiscount::create($data);

        return $this->handleServiceResponse([true, 'Discount assigned successfully', $pd, 201]);
    }

    public function update(Request $request, $id)
    {
        $pd = ProductDiscount::findOrFail($id);

        $data = $request->validate([
            'usage_type'   => 'required|in:date,usage_limit',
            'start_date'   => 'nullable|required_if:usage_type,date|date',
            'end_date'     => 'nullable|required_if:usage_type,date|date|after_or_equal:start_date',
            'usage_limit'  => 'nullable|required_if:usage_type,usage_limit|integer|min:1',
            'status'       => 'required|in:active,inactive'
        ]);

        if ($data['usage_type'] === 'date') {
            $data['usage_limit'] = null;
            $data['remaining_usage_limit'] = null;
        } else {
            // Only reset remaining limit if the total limit was changed
            if($pd->usage_limit != $data['usage_limit']){
                $data['remaining_usage_limit'] = $data['usage_limit'];
            }
            $data['start_date'] = null;
            $data['end_date'] = null;
        }

        $pd->update($data);

        return $this->handleServiceResponse([true, 'Product discount updated', $pd, 200]);
    }

    public function destroy($id)
    {
        ProductDiscount::findOrFail($id)->delete();
        return $this->handleServiceResponse([true, 'Product discount removed', null, 200]);
    }
}
