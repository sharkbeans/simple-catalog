<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index()
    {
        $quotations = Quotation::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations
        ]);
    }

    public function create()
    {
        return Inertia::render('Quotations/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_address' => 'nullable|string',
            'customer_contact' => 'nullable|string|max:255',
            'valid_from' => 'required|date',
            'valid_till' => 'required|date|after:valid_from',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $quotation = Quotation::create([
            'quotation_number' => Quotation::generateQuotationNumber(),
            'user_id' => auth()->id(), // Can be null for public users
            'customer_name' => $validated['customer_name'],
            'customer_address' => $validated['customer_address'] ?? null,
            'customer_contact' => $validated['customer_contact'] ?? null,
            'valid_from' => $validated['valid_from'],
            'valid_till' => $validated['valid_till'],
            'items' => $validated['items'],
            'subtotal' => $validated['subtotal'],
            'tax' => $validated['tax'] ?? 0,
            'total' => $validated['total'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'draft',
        ]);

        // For public users, show a success page with download link instead of redirecting to admin area
        if (!auth()->check()) {
            return Inertia::render('Quotations/Success', [
                'quotation' => $quotation
            ]);
        }

        return redirect()->route('quotations.show', $quotation)
            ->with('success', 'Quotation created successfully!');
    }

    public function show(Quotation $quotation)
    {
        $quotation->load('user');

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation
        ]);
    }

    public function edit(Quotation $quotation)
    {
        return Inertia::render('Quotations/Edit', [
            'quotation' => $quotation
        ]);
    }

    public function update(Request $request, Quotation $quotation)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_address' => 'nullable|string',
            'customer_contact' => 'nullable|string|max:255',
            'valid_from' => 'required|date',
            'valid_till' => 'required|date|after:valid_from',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.description' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:draft,sent,accepted,rejected',
        ]);

        $quotation->update($validated);

        return redirect()->route('quotations.show', $quotation)
            ->with('success', 'Quotation updated successfully!');
    }

    public function destroy(Quotation $quotation)
    {
        $quotation->delete();

        return redirect()->route('quotations.index')
            ->with('success', 'Quotation deleted successfully!');
    }

    public function view(Quotation $quotation)
    {
        return Inertia::render('Quotations/View', [
            'quotation' => $quotation
        ]);
    }

    public function createFromCart(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
        ]);

        return Inertia::render('Quotations/Create', [
            'cartItems' => $validated['items']
        ]);
    }
}
