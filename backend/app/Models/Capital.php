<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Capital extends Model
{
    protected $fillable = ['currency_id', 'initial_capital_amount', 'remaining_capital_amount'];

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
