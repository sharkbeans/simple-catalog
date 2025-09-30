<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [App\Http\Controllers\PublicCatalogController::class, 'index'])->name('public.catalog');
Route::get('/public-catalog', [App\Http\Controllers\PublicCatalogController::class, 'index'])->name('public.catalog.filtered');

// Public product details and cart routes
Route::get('/products/{product}', [App\Http\Controllers\PublicProductController::class, 'show'])->name('product.details');
Route::get('/cart', [App\Http\Controllers\PublicProductController::class, 'cart'])->name('cart');
Route::get('/contact', fn() => Inertia::render('Contact'))->name('contact');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $products = \App\Models\Product::all();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalProducts' => $products->count(),
                'totalValue' => $products->sum(fn($p) => $p->price * $p->quantity),
                'totalStock' => $products->sum('quantity'),
                'lowStock' => $products->where('quantity', '<', 10)->count(),
                'outOfStock' => $products->where('quantity', '=', 0)->count(),
                'averagePrice' => $products->avg('price'),
            ],
            'recentProducts' => $products->sortByDesc('created_at')->take(5)->values(),
            'topProducts' => $products->sortByDesc(fn($p) => $p->price * $p->quantity)->take(5)->values(),
        ]);
    })->name('dashboard');

    Route::get('/catalogue', [App\Http\Controllers\AdminCatalogController::class, 'index'])->name('catalogue');

    Route::get('/audit-logs', function () {
        $logs = \App\Models\AuditLog::with(['user', 'product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('AuditLogs', [
            'logs' => $logs,
        ]);
    })->name('audit.logs');

    Route::get('/spreadsheet', function () {
        $latestProduct = \App\Models\Product::latest('updated_at')->first();

        return Inertia::render('Spreadsheet', [
            'auth' => [
                'user' => auth()->user(),
                'token' => auth()->user()->createToken('auth-token')->plainTextToken
            ],
            'lastEditTime' => $latestProduct ? $latestProduct->updated_at->toIso8601String() : null,
        ]);
    })->name('spreadsheet');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
