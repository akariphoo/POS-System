<?php

namespace App\Http\Controllers\Discount;

use App\Http\Controllers\BaseController;
use App\Models\Discount;
use Illuminate\Http\Request;

class DiscountController extends BaseController
{
    public function index(Request $request)
    {
        $query = Discount::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%$search%");
        }

        $discounts = $query->latest()->paginate(10);

        return $this->handleServiceResponse([
            true,
            'Discounts retrieved successfully',
            $discounts,
            200
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'discount_type'  => 'required|in:buy_x_get_y,fixed,percentage,order_fixed,order_percentage',
            'value'          => 'nullable|numeric|min:0',
            'buy_quantity'   => 'nullable|integer|min:1',
            'get_quantity'   => 'nullable|integer|min:1',
        ]);

        // Extra logic for buy_x_get_y
        switch ($data['discount_type']) {
            case 'buy_x_get_y':
                if (empty($data['buy_quantity']) || empty($data['get_quantity'])) {
                    return $this->handleServiceResponse([false,'Buy X Get Y requires quantities',null,422]);
                }
                $data['value'] = null;
                break;

            default:
                $data['buy_quantity'] = null;
                $data['get_quantity'] = null;
        }

        $discount = Discount::create($data);

        return $this->handleServiceResponse([
            true,
            'Discount created successfully',
            $discount,
            201
        ]);
    }

   public function update(Request $request, $id)
   {
        $discount = Discount::findOrFail($id);

        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'discount_type'  => 'required|in:buy_x_get_y,fixed,percentage,order_fixed,order_percentage',
            'value'          => 'nullable|numeric|min:0',
            'buy_quantity'   => 'nullable|integer|min:1',
            'get_quantity'   => 'nullable|integer|min:1',
        ]);

        // CLEANUP LOGIC BASED ON TYPE
        switch ($data['discount_type']) {
            case 'buy_x_get_y':
                if (empty($data['buy_quantity']) || empty($data['get_quantity'])) {
                    return $this->handleServiceResponse([
                        false,
                        'Buy X Get Y requires buy_quantity and get_quantity',
                        null,
                        422
                    ]);
                }
                // Not needed fields
                $data['value'] = null;
                break;

            case 'fixed':
            case 'percentage':
            case 'order_fixed':
            case 'order_percentage':
                if (!isset($data['value'])) {
                    return $this->handleServiceResponse([
                        false,
                        'This discount type requires a value',
                        null,
                        422
                    ]);
                }
                // Remove Buy X Get Y fields
                $data['buy_quantity'] = null;
                $data['get_quantity'] = null;
                break;
        }

        $discount->update($data);

        return $this->handleServiceResponse([
            true,
            'Discount updated successfully',
            $discount,
            200
        ]);
   }


    public function destroy($id)
    {
        $discount = Discount::findOrFail($id);
        $discount->delete();

        return $this->handleServiceResponse([
            true,
            'Discount deleted successfully',
            null,
            200
        ]);
    }
}
