<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Setting;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $whatsappPhone = Setting::get('whatsapp_phone', '01112056867');

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'whatsapp_phone' => $whatsappPhone,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the WhatsApp phone number.
     */
    public function updateWhatsApp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'whatsapp_phone' => ['required', 'string', 'regex:/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/']
        ], [
            'whatsapp_phone.regex' => 'Phone number must be in format 01X-XXXX-XXXX (11-12 digits)'
        ]);

        // Remove dashes for storage
        $phoneNumber = str_replace('-', '', $validated['whatsapp_phone']);

        Setting::set('whatsapp_phone', $phoneNumber);

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
