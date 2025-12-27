<?php

use App\Http\Controllers\Customer\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::group(['prefix' => 'customers'], function () {
        Route::post('/list', [CustomerController::class, 'index']);      // Fetch all
        Route::post('/create', [CustomerController::class, 'store']);    // Create new
        Route::post('/show', [CustomerController::class, 'show']);       // Fetch single
        Route::post('/update', [CustomerController::class, 'update']);   // Update existing
        Route::post('/delete', [CustomerController::class, 'destroy']);  // Delete branch
    });
});
