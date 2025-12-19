<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'loginId' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('login_id', $request->loginId)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return [false, 'Error', 'The provided credentials are incorrect.', 404];
        }

        $user->tokens()->delete();

        $token = $user->createToken('pos-token')->plainTextToken;

        return [true, 'Login Successful', ['user' => $user, 'token' => $token], 200];
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return [true, 'Success','Logged out successfully', 200];
    }
}
