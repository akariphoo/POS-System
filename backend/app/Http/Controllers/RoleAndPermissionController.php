<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\RoleAndPermission\RoleListResource;

class RoleAndPermissionController extends BaseController
{
    private $cacheTime = 3600; // 1 hour

    /**
     * Combined Data for the Role Management UI
     */
    public function initData()
    {
        // Fetch both from cache or database simultaneously
        $data = Cache::remember('role_permission_init', 3600, function () {
            return [
                'roles' => RoleListResource::collection(Role::with('permissions')->get()),
                'permissions' => Permission::select('id', 'name', 'code', 'module')
                    ->orderBy('module')
                    ->get()
                    ->groupBy('module')
            ];
        });

        return $this->handleServiceResponse([
            true,
            'Initialization data retrieved',
            $data,
            200
        ]);
    }

    public function index()
    {
        // Cache the entire role list collection
        $roles = Cache::remember('roles_list', $this->cacheTime, function () {
            return Role::with('permissions')->get();
        });

        return $this->handleServiceResponse([
            true,
            'Role list retrieved',
            RoleListResource::collection($roles),
            200
        ]);
    }

    public function permissions()
    {
        // Cache permissions grouped by module
        $permissions = Cache::remember('permissions_list', $this->cacheTime, function () {
            return Permission::all()->groupBy('module');
        });

        return $this->handleServiceResponse([
            true,
            'Permissions retrieved',
            $permissions,
            200
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|unique:roles,name', 'permissions' => 'array']);

        $role = Role::create(['name' => $request->name]);
        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        $this->clearCaches(); // Important: Invalidate cache on change

        return $this->handleServiceResponse([true, 'Role created', new RoleListResource($role), 201]);
    }

    public function update(Request $request)
    {
        $role = Role::findOrFail($request->id);
        $role->update(['name' => $request->name]);
        $role->permissions()->sync($request->permissions);

        $this->clearCaches(); // Invalidate cache

        return $this->handleServiceResponse([true, 'Role updated', null, 200]);
    }

    public function destroy(Role $role)
    {
        if (in_array(strtolower($role->name), ['admin', 'super admin'])) {
            return $this->handleServiceResponse([false, 'Forbidden', null, 403]);
        }

        $role->delete();
        $this->clearCaches();

        return $this->handleServiceResponse([true, 'Role deleted', null, 200]);
    }

    private function clearCaches()
    {
        Cache::forget('roles_list');
        Cache::forget('permissions_list');
        Cache::forget('role_permission_init');
    }
}
