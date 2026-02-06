<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'discount_type', 'value', 'buy_quantity', 'get_quantity'
    ];

    public function productDiscounts()
    {
        return $this->hasMany(ProductDiscount::class);
    }
}
