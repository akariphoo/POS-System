<?php

namespace App\Http\Requests\ExchangeRate;

use Illuminate\Foundation\Http\FormRequest;

class ExchangeRateStoreRequest extends FormRequest
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
            'base_currency'  => 'required|string|max:3',
            'quote_currency' => 'required|string|max:3',
            'rate'           => 'required|numeric',
            'status'         => 'required|in:active,inactive',
            'effective_from' => 'required|date',
            'effective_to'   => 'nullable|date|after:effective_from',
        ];
    }
}
