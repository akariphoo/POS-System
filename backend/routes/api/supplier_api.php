<?php

use App\Http\Controllers\Supplier\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index']); // GET all suppliers
        Route::post('/', [SupplierController::class, 'store']); // CREATE supplier
        Route::put('/{id}', [SupplierController::class, 'update']); // UPDATE supplier
        Route::delete('/{id}', [SupplierController::class, 'destroy']); // DELETE supplier
    });
});
