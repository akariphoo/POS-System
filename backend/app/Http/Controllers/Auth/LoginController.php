<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Validate with custom messages
            $validated = $request->validate([
                'loginId' => 'required|string',
                'password' => 'required|string',
            ], [
                'loginId.required' => 'Login ID is required. Please enter your login ID.',
                'loginId.string' => 'Login ID must be a valid text value.',
                'password.required' => 'Password is required. Please enter your password.',
                'password.string' => 'Password must be a valid text value.',
            ]);

            $user = User::where('login_id', $request->loginId)->first();

            // Check if user exists
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials. Please check your login ID and try again.',
                    'errors' => [
                        'loginId' => ['The login ID you entered does not exist in our system.']
                    ]
                ], 401);
            }

            // Check if password is correct
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials. The password you entered is incorrect.',
                    'errors' => [
                        'password' => ['The password you entered is incorrect. Please try again or reset your password.']
                    ]
                ], 401);
            }

            // Delete existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('pos-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful! Welcome back.',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 200);

        } catch (ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'success' => false,
                'message' => 'Please correct the errors below and try again.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Handle unexpected errors
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred. Please try again later.',
                'errors' => []
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully. See you soon!',
            'data' => null
        ], 200);
    }
}
