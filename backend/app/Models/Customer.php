<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['is_default', 'type', 'name'];

    public function contact()
    {
        return $this->hasOne(CustomerContact::class, 'customer_id', 'id');
    }
}
