<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserListResource extends JsonResource
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
            'login_id' => $this->login_id,
            'role_id'  => $this->role_id,
            'role'  => optional($this->role)->name,
            'phone' => $this->phone,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
