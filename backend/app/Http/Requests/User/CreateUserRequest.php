<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // allow all users (adjust if needed)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'max:50',
                'regex:/^[A-Za-z0-9._ -]+$/'
            ],
            'login_id' => 'required|max:50|unique:users,login_id',
            'role_id'  => 'required|exists:roles,id',
            'phone'    => 'nullable|max:50',
            'password' => 'required|min:6|confirmed', // "confirmed"
        ];
    }

    /**
     * Optional: messages for validation errors
     */
    public function messages(): array
    {
        return [
            'password.confirmed' => 'Password and Confirm Password must match',
            'name.regex' => 'Name can only contain letters, numbers, dot, underscore, space, and hyphen',
        ];
    }
}
