<?php

namespace App\Http\Resources\Capital;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CapitalListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'currency_id' => $this->currency_id,
            'currency_name' => $this->currency->name, // For display in table
            'initial_amount' => $this->initial_capital_amount,
            'remaining_amount' => $this->remaining_capital_amount,
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
