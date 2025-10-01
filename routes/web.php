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

// Public API route to get WhatsApp phone
Route::get('/api/settings/whatsapp-phone', [App\Http\Controllers\SettingController::class, 'getWhatsappPhone']);

// Public quotation routes (accessible without authentication)
Route::get('/quotations/create', [App\Http\Controllers\QuotationController::class, 'create'])
    ->name('quotations.create');
Route::post('/quotations', [App\Http\Controllers\QuotationController::class, 'store'])
    ->name('quotations.store');
Route::get('/quotations/{quotation}/download', [App\Http\Controllers\QuotationController::class, 'download'])
    ->name('quotations.download');

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

    // Admin-only quotation management routes
    Route::get('/quotations', [App\Http\Controllers\QuotationController::class, 'index'])
        ->name('quotations.index');
    Route::get('/quotations/{quotation}', [App\Http\Controllers\QuotationController::class, 'show'])
        ->name('quotations.show');
    Route::get('/quotations/{quotation}/edit', [App\Http\Controllers\QuotationController::class, 'edit'])
        ->name('quotations.edit');
    Route::put('/quotations/{quotation}', [App\Http\Controllers\QuotationController::class, 'update'])
        ->name('quotations.update');
    Route::delete('/quotations/{quotation}', [App\Http\Controllers\QuotationController::class, 'destroy'])
        ->name('quotations.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/whatsapp', [ProfileController::class, 'updateWhatsApp'])->name('profile.whatsapp.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
