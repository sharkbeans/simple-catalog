<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\PublicCatalogController::class, 'index'])->name('public.catalog.home');

Route::get('/public-catalog', [App\Http\Controllers\PublicCatalogController::class, 'index'])->name('public.catalog');

// Public product details and cart routes
Route::get('/products/{product}', [App\Http\Controllers\PublicProductController::class, 'show'])->name('product.details');
Route::get('/cart', [App\Http\Controllers\PublicProductController::class, 'cart'])->name('cart');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/catalogue', function () {
    $user = auth()->user();
    $token = $user->createToken('auth-token')->plainTextToken;
    
    return Inertia::render('Catalogue', [
        'auth' => [
            'user' => $user,
            'token' => $token
        ]
    ]);
})->middleware(['auth', 'verified'])->name('catalogue');

Route::get('/spreadsheet', function () {
    $user = auth()->user();
    $token = $user->createToken('auth-token')->plainTextToken;
    
    return Inertia::render('Spreadsheet', [
        'auth' => [
            'user' => $user,
            'token' => $token
        ]
    ]);
})->middleware(['auth', 'verified'])->name('spreadsheet');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
