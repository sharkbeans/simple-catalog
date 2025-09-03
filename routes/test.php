<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/test-upload', function (Request $request) {
    return response()->json([
        'has_file' => $request->hasFile('image'),
        'files' => $request->allFiles(),
        'all_data' => $request->all(),
        'content_type' => $request->header('Content-Type'),
        'method' => $request->method()
    ]);
})->middleware('auth:sanctum');
