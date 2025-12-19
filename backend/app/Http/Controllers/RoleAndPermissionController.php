<?php

namespace App\Http\Controllers;

use App\Http\Resources\RoleAndPermission\RoleListResource;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleAndPermissionController extends BaseController
{
    // LIST Roles
    public function list()
    {
        $roles = Role::latest()->get();

        return $this->handleServiceResponse([
            true,
            'User list',
            RoleListResource::collection($roles),
            200
        ]);
    }
}
