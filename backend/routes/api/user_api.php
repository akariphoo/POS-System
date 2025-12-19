<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/users/list',   [UserController::class, 'list']);
    Route::post('/users/create', [UserController::class, 'create']);
    Route::post('/users/detail', [UserController::class, 'detail']);
    Route::post('/users/update', [UserController::class, 'update']);
    Route::post('/users/delete', [UserController::class, 'delete']);

});
