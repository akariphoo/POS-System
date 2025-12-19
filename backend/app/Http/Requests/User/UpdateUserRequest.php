<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id'       => 'required|exists:users,id',
            'name' => [
                'required',
                'max:50',
                'regex:/^[A-Za-z0-9._ -]+$/'
            ],
            'login_id' => 'required|max:50|unique:users,login_id,' . $this->id,
            'role_id'  => 'required|exists:roles,id',
            'phone'    => 'nullable|max:50',
            'password' => 'nullable|min:6|confirmed',
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
