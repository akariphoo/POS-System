<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TaxHistory extends Model
{
    protected $fillable = [
        'user_id',
        'tax_name',
        'tax_rate',
        'status',
        'effective_from',
        'effective_to'
    ];

    /**
     * Get the tax record that is currently pointing to this history version.
     */
    public function currentTax(): HasOne
    {
        return $this->hasOne(Tax::class, 'tax_history_id', 'id');
    }

    /**
     * Get the user who created this tax version.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
