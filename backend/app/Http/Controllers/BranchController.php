<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\BranchStoreRequest;
use App\Http\Resources\Branch\BranchListResource;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends BaseController
{
    public function index()
    {
        $branches = Branch::all();

        return $this->handleServiceResponse([
            true,
            'Branch list retrieved successfully',
            BranchListResource::collection($branches),
            200
        ]);
    }

    public function store(BranchStoreRequest $request)
    {
        $validated = $request->validated();

        if ($request->is_default) {
            Branch::where('is_default', true)->update(['is_default' => false]);
        }

        $branch = Branch::create($validated);

        return $this->handleServiceResponse([
            true,
            'Branch created successfully',
            new BranchListResource($branch),
            201
        ]);
    }

    public function show(Request $request)
    {
        $branch = Branch::findOrFail($request->id);

        return $this->handleServiceResponse([
            true,
            'Branch details',
            new BranchListResource($branch),
            200
        ]);
    }

    public function update(Request $request)
    {
        $request->validate(['id' => 'required|exists:branches,id']);

        $branch = Branch::findOrFail($request->id);

        if ($request->has('is_default') && $request->is_default == true) {
            // Unset other defaults
            Branch::where('id', '!=', $branch->id)->update(['is_default' => false]);
        }

        $branch->update($request->all());

        return $this->handleServiceResponse([
            true,
            'Branch updated successfully',
            new BranchListResource($branch),
            200
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['id' => 'required|exists:branches,id']);

        $branch = Branch::findOrFail($request->id);
        $branch->delete();

        return $this->handleServiceResponse([
            true,
            'Branch deleted successfully',
            null,
            200
        ]);
    }
}
