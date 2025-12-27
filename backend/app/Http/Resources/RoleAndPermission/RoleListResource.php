<?php

namespace App\Http\Resources\RoleAndPermission;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         return [
            'id'    => $this->id,
            'name'  => $this->name,
            'permission_ids' => $this->permissions->pluck('id'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
