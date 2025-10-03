<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index()
    {
        $quotations = Quotation::with(['user', 'reviewer'])
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
            'customer_company' => 'nullable|string|max:255',
            'customer_address' => 'nullable|string',
            'delivery_address' => 'nullable|string',
            'customer_contact' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
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
            'discount_type' => 'nullable|string|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_charges' => 'nullable|numeric|min:0',
            'handling_charges' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'additional_requirements' => 'nullable|string',
            'preferred_response_timeline' => 'nullable|string',
        ]);

        // Determine status based on user authentication
        // If admin is creating, it's draft (they can edit and approve later)
        // If customer is requesting, it's pending (needs admin approval)
        $status = auth()->check() ? 'draft' : 'pending';

        $quotation = Quotation::create([
            'quotation_number' => Quotation::generateQuotationNumber(),
            'user_id' => auth()->id(), // Can be null for public users
            'customer_name' => $validated['customer_name'],
            'customer_address' => $validated['customer_address'] ?? null,
            'customer_contact' => $validated['customer_contact'] ?? null,
            'customer_email' => $validated['customer_email'] ?? null,
            'valid_from' => $validated['valid_from'],
            'valid_till' => $validated['valid_till'],
            'items' => $validated['items'],
            'subtotal' => $validated['subtotal'],
            'tax' => $validated['tax'] ?? 0,
            'total' => $validated['total'],
            'notes' => $validated['notes'] ?? null,
            'status' => $status,
        ]);

        // For public users, show a success page
        if (!auth()->check()) {
            return Inertia::render('Quotations/Success', [
                'quotation' => $quotation,
                'message' => 'Your quotation request has been submitted! We will review it and send you the approved quotation soon.'
            ]);
        }

        return redirect()->route('quotations.show', $quotation)
            ->with('success', 'Quotation created successfully!');
    }

    public function show(Quotation $quotation)
    {
        $quotation->load(['user', 'reviewer']);

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
        // Only allow direct updates for draft or rejected quotations
        // For approved/sent quotations, use updateAndSend to notify customer
        if (in_array($quotation->status, ['approved', 'sent', 'accepted'])) {
            return back()->with('error', 'This quotation has been sent to the customer. Please use "Send Amended Quotation" to update.');
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_company' => 'nullable|string|max:255',
            'customer_address' => 'nullable|string',
            'delivery_address' => 'nullable|string',
            'customer_contact' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
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
            'discount_type' => 'nullable|string|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_charges' => 'nullable|numeric|min:0',
            'handling_charges' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'admin_notes' => 'nullable|string',
            'status' => 'nullable|string|in:draft,pending,approved,rejected,sent,accepted',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
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
            'quotation' => $quotation,
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function approve(Request $request, Quotation $quotation)
    {
        // Admin approves the quotation request
        $validated = $request->validate([
            'admin_notes' => 'nullable|string',
        ]);

        if (in_array($quotation->status, ['approved', 'sent'])) {
            return back()->with('error', 'Quotation is already approved.');
        }

        $quotation->update([
            'status' => 'approved',
            'admin_notes' => $validated['admin_notes'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Quotation approved successfully! You can now send it to the customer.');
    }

    public function reject(Request $request, Quotation $quotation)
    {
        // Admin rejects the quotation request
        $validated = $request->validate([
            'admin_notes' => 'required|string',
        ]);

        $quotation->update([
            'status' => 'rejected',
            'admin_notes' => $validated['admin_notes'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Quotation rejected.');
    }

    public function sendViaWhatsApp(Quotation $quotation)
    {
        // Mark quotation as sent
        if ($quotation->status !== 'approved') {
            return back()->with('error', 'Quotation must be approved before sending.');
        }

        // Format phone number (remove all non-numeric characters)
        $phone = preg_replace('/[^0-9]/', '', $quotation->customer_contact);

        // If phone doesn't start with country code, assume Malaysia (+60) and add it
        if (!str_starts_with($phone, '60')) {
            // Remove leading 0 if present and add 60
            $phone = '60' . ltrim($phone, '0');
        }

        $quotationUrl = route('quotations.view', $quotation->access_token);

        // Build WhatsApp message (similar format to Cart)
        $message = "Hello {$quotation->customer_name},\n\n";
        $message .= "Your quotation {$quotation->quotation_number} is ready for your review!\n\n";
        $message .= "Total: RM" . number_format($quotation->total, 2) . "\n";
        $message .= "Valid until: " . $quotation->valid_till->format('d M Y') . "\n\n";
        $message .= "Please review and approve your quotation here:\n{$quotationUrl}\n\n";
        $message .= "Thank you for your business!";

        // Encode message for URL (same as Cart)
        $encodedMessage = urlencode($message);
        $whatsappUrl = "https://wa.me/{$phone}?text={$encodedMessage}";

        // Update status to sent
        $quotation->update(['status' => 'sent']);

        return redirect()->away($whatsappUrl);
    }

    public function updateAndSend(Request $request, Quotation $quotation)
    {
        // Admin updates quotation and sends amendment to customer
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_company' => 'nullable|string|max:255',
            'customer_address' => 'nullable|string',
            'delivery_address' => 'nullable|string',
            'customer_contact' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
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
            'discount_type' => 'nullable|string|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'shipping_charges' => 'nullable|numeric|min:0',
            'handling_charges' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        // Store original values if not already stored
        if (!$quotation->original_values) {
            $quotation->original_values = [
                'items' => $quotation->items,
                'subtotal' => $quotation->subtotal,
                'tax' => $quotation->tax,
                'discount_type' => $quotation->discount_type,
                'discount_value' => $quotation->discount_value,
                'discount_amount' => $quotation->discount_amount,
                'shipping_charges' => $quotation->shipping_charges,
                'handling_charges' => $quotation->handling_charges,
                'total' => $quotation->total,
            ];
        }

        // Update quotation with new values
        $quotation->update(array_merge($validated, [
            'amended_at' => now(),
            'status' => 'sent', // Send to customer for approval
            'customer_approved_at' => null, // Reset approval
            'customer_responded_at' => null,
            'customer_rejection_reason' => null,
        ]));

        // Format phone number (same logic as sendViaWhatsApp)
        $phone = preg_replace('/[^0-9]/', '', $quotation->customer_contact);

        // If phone doesn't start with country code, assume Malaysia (+60) and add it
        if (!str_starts_with($phone, '60')) {
            // Remove leading 0 if present and add 60
            $phone = '60' . ltrim($phone, '0');
        }

        $quotationUrl = route('quotations.view', $quotation->access_token);

        // Build WhatsApp message (similar format to Cart)
        $message = "Hello {$quotation->customer_name},\n\n";
        $message .= "We have updated your quotation {$quotation->quotation_number}.\n\n";
        $message .= "Updated Total: RM" . number_format($quotation->total, 2) . "\n";
        $message .= "Valid until: " . $quotation->valid_till->format('d M Y') . "\n\n";
        $message .= "Please review the updated quotation and approve or request changes:\n{$quotationUrl}\n\n";
        $message .= "Thank you for your business!";

        // Encode message for URL (same as Cart)
        $encodedMessage = urlencode($message);
        $whatsappUrl = "https://wa.me/{$phone}?text={$encodedMessage}";

        // Return the WhatsApp URL for Inertia to handle
        return back()->with([
            'whatsappUrl' => $whatsappUrl,
            'success' => 'Quotation updated successfully! Redirecting to WhatsApp...'
        ]);
    }

    public function customerApprove(Quotation $quotation)
    {
        // Only allow approval if quotation was sent by admin
        if ($quotation->status !== 'sent') {
            return back()->with('error', 'This quotation is not ready for approval.');
        }

        // Check if already responded
        if ($quotation->customer_responded_at) {
            return back()->with('error', 'You have already responded to this quotation.');
        }

        $quotation->update([
            'status' => 'accepted',
            'customer_approved_at' => now(),
            'customer_responded_at' => now(),
            'customer_ip' => request()->ip(),
        ]);

        return back()->with('success', 'Quotation approved successfully! Thank you for your business.');
    }

    public function customerReject(Request $request, Quotation $quotation)
    {
        // Customer rejects the amendment
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($quotation->status !== 'sent') {
            return back()->with('error', 'This quotation cannot be rejected at this time.');
        }

        if ($quotation->customer_responded_at) {
            return back()->with('error', 'You have already responded to this quotation.');
        }

        $quotation->update([
            'status' => 'pending', // Send back to pending for admin to review
            'customer_responded_at' => now(),
            'customer_rejection_reason' => $validated['rejection_reason'],
            'customer_ip' => request()->ip(),
        ]);

        return back()->with('success', 'Your feedback has been submitted. We will review your concerns and get back to you.');
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
