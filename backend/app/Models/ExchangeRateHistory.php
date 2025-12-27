<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRateHistory extends Model
{
    protected $fillable = [
        'user_id',
        'base_currency',
        'quote_currency',
        'rate',
        'status',
        'effective_from',
        'effective_to'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
