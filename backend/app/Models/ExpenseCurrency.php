<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCurrency extends Model
{
    protected $fillable = ['expense_id', 'currency_id', 'amount'];

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }
}
