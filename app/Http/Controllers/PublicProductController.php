<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicProductController extends Controller
{
    /**
     * Show product details page
     */
    public function show(Product $product)
    {
        return Inertia::render('ProductDetails', [
            'product' => $product
        ]);
    }

    /**
     * Show cart page
     */
    public function cart()
    {
        return Inertia::render('Cart');
    }
}
