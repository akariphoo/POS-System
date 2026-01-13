<?php

use App\Http\Controllers\Tax\TaxController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('taxes')->group(function () {
        Route::get('/', [TaxController::class, 'index']);
        Route::post('/', [TaxController::class, 'store']);
        Route::put('/{id}', [TaxController::class, 'update']);
        Route::delete('/{id}', [TaxController::class, 'destroy']);
    });
});
