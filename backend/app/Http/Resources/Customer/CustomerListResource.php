<?php

namespace App\Http\Resources\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'type'       => $this->type,
            'is_default' => (bool) $this->is_default,

            'contact' => [
                'phone'   => $this->contact->phone ?? 'N/A',
                'nrc'     => $this->contact->nrc ?? 'N/A',
                'address' => $this->contact->address ?? '',
            ],

            'created_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
