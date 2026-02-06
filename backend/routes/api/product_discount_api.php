<?php

use App\Http\Controllers\ProductDiscount\ProductDiscountController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('product-discounts')->group(function () {
        Route::get('/form-data', [ProductDiscountController::class, 'formData']);
        Route::get('/', [ProductDiscountController::class, 'index']);
        Route::post('/', [ProductDiscountController::class, 'store']);
        Route::put('/{id}', [ProductDiscountController::class, 'update']);
        Route::delete('/{id}', [ProductDiscountController::class, 'destroy']);
    });
});
