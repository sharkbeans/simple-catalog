<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource for public access.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Product::query();
        
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
        return response()->json($products);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();
        
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
        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'quantity' => 'required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            ]);

            // Handle image upload
            $imageUrl = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('products', $fileName, 'public');
                $imageUrl = '/storage/' . $filePath;
            }

            $productData = [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'quantity' => $validated['quantity'],
                'image_url' => $imageUrl,
            ];

            $product = Product::create($productData);
            return response()->json($product, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        try {
            // Debug logging
            \Log::info('Update request received', [
                'has_file' => $request->hasFile('image'),
                'files' => $request->allFiles(),
                'all_data' => $request->all()
            ]);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|required|numeric|min:0',
                'quantity' => 'sometimes|required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle image upload
            $updateData = [];
            if (isset($validated['name'])) $updateData['name'] = $validated['name'];
            if (isset($validated['description'])) $updateData['description'] = $validated['description'];
            if (isset($validated['price'])) $updateData['price'] = $validated['price'];
            if (isset($validated['quantity'])) $updateData['quantity'] = $validated['quantity'];

            if ($request->hasFile('image')) {
                \Log::info('Image file detected, processing upload');
                
                // Delete old image if it exists
                if ($product->image_url) {
                    $oldImagePath = str_replace('/storage/', '', $product->image_url);
                    Storage::disk('public')->delete($oldImagePath);
                }
                
                // Upload new image using storeAs method with proper disk
                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('products', $fileName, 'public');
                $updateData['image_url'] = '/storage/' . $filePath;
                
                \Log::info('Image uploaded successfully', ['path' => $filePath, 'full_path' => '/storage/' . $filePath]);
            } else {
                \Log::info('No image file in request');
            }

            $product->update($updateData);
            return response()->json($product->fresh());
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Update the specified resource with image upload (alternative method).
     */
    public function updateWithImage(Request $request, Product $product): JsonResponse
    {
        try {
            \Log::info('UpdateWithImage request received', [
                'has_file' => $request->hasFile('image'),
                'files' => $request->allFiles(),
                'all_data' => $request->all()
            ]);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|required|numeric|min:0',
                'quantity' => 'sometimes|required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle image upload
            $updateData = [];
            if (isset($validated['name'])) $updateData['name'] = $validated['name'];
            if (isset($validated['description'])) $updateData['description'] = $validated['description'];
            if (isset($validated['price'])) $updateData['price'] = $validated['price'];
            if (isset($validated['quantity'])) $updateData['quantity'] = $validated['quantity'];

            if ($request->hasFile('image')) {
                \Log::info('Image file detected in updateWithImage, processing upload');
                
                // Delete old image if it exists
                if ($product->image_url) {
                    $oldImagePath = str_replace('/storage/', '', $product->image_url);
                    Storage::disk('public')->delete($oldImagePath);
                }
                
                // Upload new image using storeAs method with proper disk
                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('products', $fileName, 'public');
                $updateData['image_url'] = '/storage/' . $filePath;
                
                \Log::info('Image uploaded successfully in updateWithImage', ['path' => $filePath, 'full_path' => '/storage/' . $filePath]);
            } else {
                \Log::info('No image file in updateWithImage request');
            }

            $product->update($updateData);
            return response()->json($product->fresh());
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        // Delete associated image file if it exists
        if ($product->image_url) {
            $imagePath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($imagePath);
        }
        
        $product->delete();
        return response()->json(null, 204);
    }
}
