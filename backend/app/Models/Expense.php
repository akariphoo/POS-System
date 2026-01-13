<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = ['date', 'expense_category_id', 'description'];

    // Get the category this expense belongs to
    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    // Get all currency amounts for this expense
    public function expenseCurrencies()
    {
        return $this->hasMany(ExpenseCurrency::class);
    }
}
