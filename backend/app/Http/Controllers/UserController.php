<?php

namespace App\Http\Controllers;

use App\Http\Controllers\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\CreateUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserListResource;
use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseController
{
    public function initData()
    {
        return $this->handleServiceResponse([
            true,
            'Init data',
            [
                'users'    => UserListResource::collection(User::latest()->get()),
                'roles'    => Role::select('id', 'name')->get(),
                'branches' => Branch::select('id', 'branch_name')->get(),
            ],
            200
        ]);
    }


    // LIST USERS
    public function list()
    {
        $users = User::latest()->get();

        return $this->handleServiceResponse([
            true,
            'User list',
            UserListResource::collection($users),
            200
        ]);
    }

    // CREATE USER
    public function create(CreateUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($request['password']);
        $user = User::create($data);

        return $this->handleServiceResponse([
            true,
            'User created successfully',
            new UserListResource($user),
            201
        ]);
    }

    // USER DETAIL
    public function detail(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:users,id'
        ]);

        $user = User::find($request->id);

        return $this->handleServiceResponse([
            true,
            'User detail',
            new UserListResource($user),
            200
        ]);
    }

    // UPDATE USER
    public function update(UpdateUserRequest $request)
    {
        $request->validated();

        $user = User::findOrFail($request->id);

        $data = $request->only('branch_id', 'name', 'login_id', 'role_id', 'phone');

        if (!empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return $this->handleServiceResponse([
            true,
            'User updated successfully',
            new UserListResource($user->fresh()),
            200
        ]);
    }

    // DELETE USER
    public function delete(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:users,id'
        ]);

        User::find($request->id)->delete();

        return $this->handleServiceResponse([
            true,
            'User deleted successfully',
            null,
            200
        ]);
    }
}
