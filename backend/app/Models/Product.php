<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['product_price_history_id', 'sku', 'barcode', 'name', 'description','image'];
}
