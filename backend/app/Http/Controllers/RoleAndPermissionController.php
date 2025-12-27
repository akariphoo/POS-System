<?php

namespace App\Http\Controllers;

use App\Http\Resources\RoleAndPermission\RoleListResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleAndPermissionController extends BaseController
{
    /**
     * Get all roles with permissions
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();

        return $this->handleServiceResponse([
            true,
            'Role list retrieved successfully',
            RoleListResource::collection($roles),
            200
        ]);
    }

    /**
     * Get all permissions grouped by module
     */
    public function permissions()
    {
        $permissions = Permission::all()->groupBy('module');

        return $this->handleServiceResponse([
            true,
            'Permissions list retrieved successfully',
            $permissions,
            200
        ]);
    }

    /**
     * Store a new role
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return $this->handleServiceResponse([
            true,
            'Role created successfully',
            new RoleListResource($role->load('permissions')),
            201
        ]);
    }

    /**
     * Update an existing role
     */
    public function update(Request $request)
    {
        $role = Role::findOrFail($request->id);
        
        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id,
            'permissions' => 'array'
        ]);

        $role->update(['name' => $request->name]);
        $role->permissions()->sync($request->permissions);

        return $this->handleServiceResponse([
            true,
            'Role updated successfully',
            new RoleListResource($role->load('permissions')),
            200
        ]);
    }

    /**
     * Delete a role
     */
    public function destroy(Role $role)
    {
        // Prevent deleting critical roles if necessary
        if (in_array(strtolower($role->name), ['admin', 'super admin'])) {
            return $this->handleServiceResponse([false, 'Cannot delete system admin role', null, 403]);
        }

        $role->delete();

        return $this->handleServiceResponse([
            true,
            'Role deleted successfully',
            null,
            200
        ]);
    }
}
