<?php

use App\Http\Controllers\Currency\CurrencyController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::group(['prefix' => 'currency'], function () {
        Route::post('/list', [CurrencyController::class, 'index']);
        Route::post('/create', [CurrencyController::class, 'store']);
        Route::post('/show', [CurrencyController::class, 'show']);
        Route::post('/update', [CurrencyController::class, 'update']);
        Route::post('/delete', [CurrencyController::class, 'destroy']);
    });
});
