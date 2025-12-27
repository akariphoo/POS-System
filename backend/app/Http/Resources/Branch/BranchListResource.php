<?php

namespace App\Http\Resources\Branch;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchListResource extends JsonResource
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
            'branch_name' => $this->branch_name,
            'city' => $this->city,
            'state' => $this->state,
            'address' => $this->address,
            'is_default' => (bool)$this->is_default,
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
