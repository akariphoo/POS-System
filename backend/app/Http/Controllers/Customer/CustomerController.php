<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CustomerStoreRequest;
use App\Http\Requests\Customer\CustomerUpdateRequest;
use App\Http\Resources\Customer\CustomerListResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends BaseController
{
    // GET: List
    public function index()
    {
        $customers = Customer::with('contact')->get();

        return $this->handleServiceResponse([
            true,
            'Customer list retrieved successfully',
            CustomerListResource::collection($customers),
            200
        ]);
    }

    // POST: Create
    public function store(CustomerStoreRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $customer = Customer::create([
                'name' => $request->name,
                'type' => $request->type,
                'is_default' => $request->is_default
            ]);

            $customer->contact()->create([
                'phone'   => $request->phone,
                'nrc'     => $request->nrc,
                'address' => $request->address
            ]);

            return $this->handleServiceResponse([true, 'Created', $customer->load('contact'), 201]);
        });
    }

    // POST: Single
    public function show($id)
    {
        $customer = Customer::with('contacts')->find($id);
        if (!$customer) {
            return $this->handleServiceResponse([false, 'Customer not found', null, 404]);
        }
        return $this->handleServiceResponse([
            true,
            'Customer details retrieved',
            new CustomerListResource($customer),
            200
        ]);
    }

    // POST: Update
    public function update(CustomerUpdateRequest $request)
    {
        $customer = Customer::find($request->id);
        if (!$customer) return $this->handleServiceResponse([false, 'Not found', null, 404]);

        return DB::transaction(function () use ($request) {
            $customer = Customer::findOrFail($request->id);
            $customer->update($request->only(['name', 'type', 'is_default']));

            // updateOrCreate ensures if no contact existed yet, it creates one
            $customer->contact()->updateOrCreate(
                ['customer_id' => $customer->id],
                [
                    'phone'   => $request->phone,
                    'nrc'     => $request->nrc,
                    'address' => $request->address
                ]
            );

            return $this->handleServiceResponse([true, 'Updated', $customer->load('contact'), 200]);
        });
    }

    // DELETE
    public function destroy(Request $request)
    {
        $customer = Customer::find($request->id);
        if ($customer) {
            $customer->delete();
            return $this->handleServiceResponse([true, 'Customer deleted', null, 200]);
        }
        return $this->handleServiceResponse([false, 'Customer not found', null, 404]);
    }
}
