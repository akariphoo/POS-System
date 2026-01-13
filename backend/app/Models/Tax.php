<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tax extends Model
{
    protected $fillable = ['tax_history_id'];

   public function history(): BelongsTo
    {
        return $this->belongsTo(TaxHistory::class, 'tax_history_id', 'id');
    }
}
