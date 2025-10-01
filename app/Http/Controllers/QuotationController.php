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

    public function download(Quotation $quotation)
    {
        require_once public_path('quolib/quotr.php');

        global $quotr;
        $quotr->reset();

        // Set company information (should be configurable in settings)
        $quotr->set('company', [
            url('/logo.png'),
            public_path('logo.png'),
            config('app.name', 'Simple Catalog'),
            'Your Company Address',
            'Phone: xxx-xxx-xxx',
            url('/'),
            'info@example.com'
        ]);

        // Set quotation header
        $quotr->set('head', [
            ['QUOTATION #', $quotation->quotation_number],
            ['Valid From', $quotation->valid_from->format('Y-m-d')],
            ['Valid Till', $quotation->valid_till->format('Y-m-d')],
        ]);

        // Set customer
        $customerInfo = [$quotation->customer_name];
        if ($quotation->customer_address) {
            $customerInfo[] = $quotation->customer_address;
        }
        if ($quotation->customer_contact) {
            $customerInfo[] = $quotation->customer_contact;
        }
        $quotr->set('customer', $customerInfo);

        // Set items
        $items = [];
        foreach ($quotation->items as $item) {
            $items[] = [
                $item['name'],
                $item['description'] ?? '',
                $item['quantity'],
                'RM' . number_format($item['price'], 2),
                'RM' . number_format($item['total'], 2)
            ];
        }
        $quotr->set('items', $items);

        // Set totals
        $totals = [
            ['SUB-TOTAL', 'RM' . number_format($quotation->subtotal, 2)]
        ];
        if ($quotation->tax > 0) {
            $totals[] = ['TAX', 'RM' . number_format($quotation->tax, 2)];
        }
        $totals[] = ['GRAND TOTAL', 'RM' . number_format($quotation->total, 2)];
        $quotr->set('totals', $totals);

        // Set notes if any
        if ($quotation->notes) {
            $quotr->set('notes', explode("\n", $quotation->notes));
        }

        // Set acceptance
        $quotr->set('accept', true);

        // Use simple template (only PDF supported)
        $quotr->template('simple');

        // Output PDF
        $filename = str_replace(['/', ' '], '_', $quotation->quotation_number);
        $quotr->outputPDF(2, "{$filename}.pdf");
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
