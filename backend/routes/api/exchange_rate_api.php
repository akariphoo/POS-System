<?php

use App\Http\Controllers\ExchangeRate\ExchangeRateController;
use App\Http\Controllers\RoleAndPermissionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Fetching Data
    Route::post('/exchange-rate/list', [ExchangeRateController::class, 'index']);
    Route::post('/exchange-rate/store', [ExchangeRateController::class, 'store']);
    Route::post('/exchange-rate/history', [ExchangeRateController::class, 'history']);
});
