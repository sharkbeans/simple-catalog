<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AuditLog;
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
                'product_code' => 'required|string|max:50|unique:products,product_code',
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
                'product_code' => $validated['product_code'],
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'quantity' => $validated['quantity'],
                'image_url' => $imageUrl,
            ];

            $product = Product::create($productData);

            // Log the creation
            AuditLog::create([
                'user_id' => auth()->id(),
                'product_id' => $product->id,
                'action' => 'created',
                'product_name' => $product->name,
                'new_values' => $productData,
            ]);

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
                'product_code' => 'sometimes|required|string|max:50|unique:products,product_code,' . $product->id,
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|required|numeric|min:0',
                'quantity' => 'sometimes|required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle image upload
            $updateData = [];
            if (isset($validated['product_code'])) $updateData['product_code'] = $validated['product_code'];
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

            // Store old values before update
            $oldValues = $product->only(array_keys($updateData));

            // Check if there are actual changes before updating
            $hasChanges = false;
            foreach ($updateData as $key => $newValue) {
                $oldValue = $oldValues[$key] ?? null;
                // Compare values, handle numeric comparisons properly
                if (is_numeric($oldValue) && is_numeric($newValue)) {
                    // Compare as rounded decimals to avoid floating point precision issues
                    if ($key === 'price') {
                        // Compare price to 2 decimal places
                        if (round((float)$oldValue, 2) != round((float)$newValue, 2)) {
                            $hasChanges = true;
                            break;
                        }
                    } else {
                        // Compare integers or other numbers
                        if ((int)$oldValue != (int)$newValue) {
                            $hasChanges = true;
                            break;
                        }
                    }
                } else if ($oldValue != $newValue) {
                    $hasChanges = true;
                    break;
                }
            }

            // Always update the product (to refresh timestamps, etc)
            $product->update($updateData);

            // Only log if there are actual changes
            if ($hasChanges) {
                // Format values consistently for audit log to avoid display issues
                $formattedOldValues = [];
                $formattedNewValues = [];
                foreach ($updateData as $key => $newValue) {
                    $oldValue = $oldValues[$key] ?? null;
                    // Only include fields that actually changed
                    if (is_numeric($oldValue) && is_numeric($newValue)) {
                        if ($key === 'price') {
                            if (round((float)$oldValue, 2) != round((float)$newValue, 2)) {
                                $formattedOldValues[$key] = number_format((float)$oldValue, 2, '.', '');
                                $formattedNewValues[$key] = number_format((float)$newValue, 2, '.', '');
                            }
                        } else {
                            if ((int)$oldValue != (int)$newValue) {
                                $formattedOldValues[$key] = (int)$oldValue;
                                $formattedNewValues[$key] = (int)$newValue;
                            }
                        }
                    } else if ($oldValue != $newValue) {
                        $formattedOldValues[$key] = $oldValue;
                        $formattedNewValues[$key] = $newValue;
                    }
                }

                AuditLog::create([
                    'user_id' => auth()->id(),
                    'product_id' => $product->id,
                    'action' => 'updated',
                    'product_name' => $product->name,
                    'old_values' => $formattedOldValues,
                    'new_values' => $formattedNewValues,
                ]);
            }

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
                'product_code' => 'sometimes|required|string|max:50|unique:products,product_code,' . $product->id,
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|required|numeric|min:0',
                'quantity' => 'sometimes|required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Handle image upload
            $updateData = [];
            if (isset($validated['product_code'])) $updateData['product_code'] = $validated['product_code'];
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

            // Store old values before update
            $oldValues = $product->only(array_keys($updateData));

            // Check if there are actual changes before updating
            $hasChanges = false;
            foreach ($updateData as $key => $newValue) {
                $oldValue = $oldValues[$key] ?? null;
                // Compare values, handle numeric comparisons properly
                if (is_numeric($oldValue) && is_numeric($newValue)) {
                    // Compare as rounded decimals to avoid floating point precision issues
                    if ($key === 'price') {
                        // Compare price to 2 decimal places
                        if (round((float)$oldValue, 2) != round((float)$newValue, 2)) {
                            $hasChanges = true;
                            break;
                        }
                    } else {
                        // Compare integers or other numbers
                        if ((int)$oldValue != (int)$newValue) {
                            $hasChanges = true;
                            break;
                        }
                    }
                } else if ($oldValue != $newValue) {
                    $hasChanges = true;
                    break;
                }
            }

            // Always update the product (to refresh timestamps, etc)
            $product->update($updateData);

            // Only log if there are actual changes
            if ($hasChanges) {
                // Format values consistently for audit log to avoid display issues
                $formattedOldValues = [];
                $formattedNewValues = [];
                foreach ($updateData as $key => $newValue) {
                    $oldValue = $oldValues[$key] ?? null;
                    // Only include fields that actually changed
                    if (is_numeric($oldValue) && is_numeric($newValue)) {
                        if ($key === 'price') {
                            if (round((float)$oldValue, 2) != round((float)$newValue, 2)) {
                                $formattedOldValues[$key] = number_format((float)$oldValue, 2, '.', '');
                                $formattedNewValues[$key] = number_format((float)$newValue, 2, '.', '');
                            }
                        } else {
                            if ((int)$oldValue != (int)$newValue) {
                                $formattedOldValues[$key] = (int)$oldValue;
                                $formattedNewValues[$key] = (int)$newValue;
                            }
                        }
                    } else if ($oldValue != $newValue) {
                        $formattedOldValues[$key] = $oldValue;
                        $formattedNewValues[$key] = $newValue;
                    }
                }

                AuditLog::create([
                    'user_id' => auth()->id(),
                    'product_id' => $product->id,
                    'action' => 'updated',
                    'product_name' => $product->name,
                    'old_values' => $formattedOldValues,
                    'new_values' => $formattedNewValues,
                ]);
            }

            return response()->json($product->fresh());
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Toggle product visibility.
     */
    public function toggleVisibility(Product $product): JsonResponse
    {
        $oldValue = $product->is_hidden;
        $product->is_hidden = !$product->is_hidden;
        $product->save();

        // Log the visibility change
        AuditLog::create([
            'user_id' => auth()->id(),
            'product_id' => $product->id,
            'action' => $product->is_hidden ? 'hidden' : 'shown',
            'product_name' => $product->name,
            'old_values' => ['is_hidden' => $oldValue],
            'new_values' => ['is_hidden' => $product->is_hidden],
        ]);

        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        // Store product data before deletion
        $productData = $product->only(['name', 'price', 'quantity', 'description']);

        // Delete associated image file if it exists
        if ($product->image_url) {
            $imagePath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($imagePath);
        }

        // Log the deletion before deleting the product
        AuditLog::create([
            'user_id' => auth()->id(),
            'product_id' => $product->id,
            'action' => 'deleted',
            'product_name' => $product->name,
            'old_values' => $productData,
        ]);

        $product->delete();
        return response()->json(null, 204);
    }

    /**
     * Import products from CSV file.
     */
    public function importCsv(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'csv_file' => 'required|file|mimes:csv,txt|max:10240',
            ]);

            $file = $request->file('csv_file');
            $csvData = array_map('str_getcsv', file($file->getRealPath()));

            // Get headers from first row
            $headers = array_map('trim', $csvData[0]);
            unset($csvData[0]);

            $imported = [];
            $errors = [];
            $skipped = [];

            foreach ($csvData as $rowIndex => $row) {
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                // Map CSV columns to data
                $rowData = array_combine($headers, $row);

                try {
                    // Validate required fields
                    if (empty($rowData['product_code']) || empty($rowData['name']) ||
                        empty($rowData['price']) || !isset($rowData['quantity'])) {
                        $skipped[] = [
                            'row' => $rowIndex + 1,
                            'reason' => 'Missing required fields (product_code, name, price, or quantity)',
                            'data' => $rowData
                        ];
                        continue;
                    }

                    // Check if product code already exists
                    if (Product::where('product_code', $rowData['product_code'])->exists()) {
                        $skipped[] = [
                            'row' => $rowIndex + 1,
                            'reason' => 'Product code already exists: ' . $rowData['product_code'],
                            'data' => $rowData
                        ];
                        continue;
                    }

                    // Create product
                    $productData = [
                        'product_code' => trim($rowData['product_code']),
                        'name' => trim($rowData['name']),
                        'description' => isset($rowData['description']) ? trim($rowData['description']) : null,
                        'price' => floatval($rowData['price']),
                        'quantity' => intval($rowData['quantity']),
                        'image_url' => isset($rowData['image_url']) ? trim($rowData['image_url']) : null,
                    ];

                    $product = Product::create($productData);

                    // Log the creation
                    AuditLog::create([
                        'user_id' => auth()->id(),
                        'product_id' => $product->id,
                        'action' => 'created',
                        'product_name' => $product->name,
                        'new_values' => $productData,
                    ]);

                    $imported[] = $product;

                } catch (\Exception $e) {
                    $errors[] = [
                        'row' => $rowIndex + 1,
                        'error' => $e->getMessage(),
                        'data' => $rowData
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'imported_count' => count($imported),
                'skipped_count' => count($skipped),
                'error_count' => count($errors),
                'imported' => $imported,
                'skipped' => $skipped,
                'errors' => $errors,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'CSV import failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
