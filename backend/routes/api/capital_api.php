<?php

use App\Http\Controllers\Capital\CapitalController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::group(['prefix' => 'capital'], function () {
        Route::post('/list', [CapitalController::class, 'index']);
        Route::post('/create', [CapitalController::class, 'store']);
        Route::post('/show', [CapitalController::class, 'show']);
        Route::post('/update', [CapitalController::class, 'update']);
        Route::post('/delete', [CapitalController::class, 'destroy']);
    });
});
