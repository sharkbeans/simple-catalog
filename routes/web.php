<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\PublicCatalogController::class, 'index'])->name('public.catalog');

// Public product details and cart routes
Route::get('/products/{product}', [App\Http\Controllers\PublicProductController::class, 'show'])->name('product.details');
Route::get('/cart', [App\Http\Controllers\PublicProductController::class, 'cart'])->name('cart');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');

    Route::get('/catalogue', function () {
        return Inertia::render('Catalogue', [
            'auth' => [
                'user' => auth()->user(),
                'token' => auth()->user()->createToken('auth-token')->plainTextToken
            ]
        ]);
    })->name('catalogue');

    Route::get('/spreadsheet', function () {
        return Inertia::render('Spreadsheet', [
            'auth' => [
                'user' => auth()->user(),
                'token' => auth()->user()->createToken('auth-token')->plainTextToken
            ]
        ]);
    })->name('spreadsheet');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
