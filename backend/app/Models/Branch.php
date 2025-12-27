<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'is_default',
        'branch_name',
        'city',
        'state',
        'address',
    ];
}
