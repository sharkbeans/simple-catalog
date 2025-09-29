<?php

use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public API endpoint - no authentication required
Route::get('/products/public', [ProductController::class, 'publicIndex']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('products', ProductController::class);
    
    // Separate route for updating products with images
    Route::post('products/{product}/update-with-image', [ProductController::class, 'updateWithImage']);
});
