<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestUploadController extends Controller
{
    public function testUpload(Request $request): JsonResponse
    {
        \Log::info('Test upload started', [
            'has_file' => $request->hasFile('image'),
            'files' => $request->allFiles(),
            'all_data' => $request->all(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method()
        ]);

        try {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                
                \Log::info('File details', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'is_valid' => $file->isValid(),
                    'error' => $file->getError()
                ]);

                // Test upload
                $fileName = time() . '_test_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('test', $fileName, 'public');
                
                return response()->json([
                    'success' => true,
                    'message' => 'File uploaded successfully',
                    'path' => $filePath,
                    'full_url' => '/storage/' . $filePath
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No file received'
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Upload error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ]);
        }
    }
}
