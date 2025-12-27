<?php

use App\Http\Controllers\RoleAndPermissionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Fetching Data
    Route::post('/roles/list', [RoleAndPermissionController::class, 'index']);
    Route::post('/permissions/list', [RoleAndPermissionController::class, 'permissions']);
    Route::post('/roles/store', [RoleAndPermissionController::class, 'store']);
    Route::post('/roles/update', [RoleAndPermissionController::class, 'update']);
    Route::post('/roles/delete/{role}', [RoleAndPermissionController::class, 'destroy']);
});
