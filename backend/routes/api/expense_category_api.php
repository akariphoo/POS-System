<?php

use App\Http\Controllers\ExpenseCategory\ExpenseCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('expense-categories')->group(function () {
        Route::get('/', [ExpenseCategoryController::class, 'index']);          // List all
        Route::post('/', [ExpenseCategoryController::class, 'store']);         // Create new
        Route::put('/{id}', [ExpenseCategoryController::class, 'update']);     // Update specific
        Route::delete('/{id}', [ExpenseCategoryController::class, 'destroy']);  // Delete specific
    });
});
