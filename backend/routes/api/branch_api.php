<?php

use App\Http\Controllers\BranchController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::group(['prefix' => 'branches'], function () {
        Route::post('/list', [BranchController::class, 'index']);      // Fetch all
        Route::post('/create', [BranchController::class, 'store']);    // Create new
        Route::post('/show', [BranchController::class, 'show']);       // Fetch single
        Route::post('/update', [BranchController::class, 'update']);   // Update existing
        Route::post('/delete', [BranchController::class, 'destroy']);  // Delete branch
    });
});
