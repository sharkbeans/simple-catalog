<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function getWhatsappPhone()
    {
        $phone = Setting::get('whatsapp_phone', '01112056867');

        // Format for WhatsApp URL: +601XXXXXXXX
        $formattedPhone = '+6' . $phone;

        return response()->json([
            'phone' => $phone,
            'whatsapp_url_format' => $formattedPhone
        ]);
    }
}
