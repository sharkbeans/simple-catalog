<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCatalogController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->where('is_hidden', false);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('price', 'like', '%' . $searchTerm . '%')
                  ->orWhere('quantity', 'like', '%' . $searchTerm . '%');
            });
        }

        // Sorting functionality
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        $allowedSorts = ['created_at', 'price', 'quantity', 'name'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $products = $query->orderBy($sortBy, $sortDirection)->get();

        return Inertia::render('Catalogue', [
            'products' => $products,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortBy,
                'direction' => $sortDirection
            ],
            'auth' => [
                'user' => auth()->user(),
                'token' => auth()->user()->createToken('auth-token')->plainTextToken
            ]
        ]);
    }
}