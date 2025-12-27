<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
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
     */
    public function rules(): array
    {
        return [
            // Ensure ID is provided for the unique check
            'id' => 'required|exists:users,id',
            'branch_id'  => 'required|exists:branches,id',
            'name' => [
                'required',
                'max:50',
                'regex:/^[A-Za-z0-9._ -]+$/'
            ],

            'login_id' => [
                'required',
                'max:50',
                // Ignore the current user ID during the unique check
                'unique:users,login_id,' . $this->id,
                // English letters, numbers, and dashes ONLY
                'regex:/^[A-Za-z0-9-]+$/',
            ],

            'role_id'  => 'required|exists:roles,id',
            'phone'    => 'nullable|max:50',

            // Password is "nullable" on update so you don't have to change it every time
            'password' => [
                'nullable',
                'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ];
    }

    /**
     * Custom messages for validation errors
     */
    public function messages(): array
    {
        return [
            'password.confirmed' => 'Password and Confirm Password must match',
            'name.regex'         => 'Name can only contain letters, numbers, dot, underscore, space, and hyphen',
            'login_id.regex'     => 'Login ID can only contain English letters, numbers, and dashes ( & other special character).',
        ];
    }
}
