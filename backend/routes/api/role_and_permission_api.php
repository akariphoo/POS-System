<?php

use App\Http\Controllers\RoleAndPermissionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/roles/list',   [RoleAndPermissionController::class, 'list']);
   });
