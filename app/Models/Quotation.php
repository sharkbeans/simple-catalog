<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Quotation extends Model
{
    protected $fillable = [
        'quotation_number',
        'access_token',
        'user_id',
        'customer_name',
        'customer_company',
        'customer_address',
        'delivery_address',
        'customer_contact',
        'customer_email',
        'valid_from',
        'valid_till',
        'items',
        'subtotal',
        'tax',
        'discount_type',
        'discount_value',
        'discount_amount',
        'shipping_charges',
        'handling_charges',
        'total',
        'notes',
        'additional_requirements',
        'preferred_response_timeline',
        'admin_notes',
        'status',
        'priority',
        'reviewed_by',
        'reviewed_at',
        'amended_at',
        'original_values',
        'customer_approved_at',
        'customer_responded_at',
        'customer_rejection_reason',
        'customer_ip',
    ];

    protected $casts = [
        'items' => 'array',
        'original_values' => 'array',
        'valid_from' => 'date',
        'valid_till' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_charges' => 'decimal:2',
        'handling_charges' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($quotation) {
            if (empty($quotation->access_token)) {
                $quotation->access_token = self::generateAccessToken();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public static function generateQuotationNumber()
    {
        $prefix = 'QT';
        $year = date('Y');
        $month = date('m');

        $lastQuotation = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastQuotation) {
            $lastNumber = (int) substr($lastQuotation->quotation_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$year}{$month}-{$newNumber}";
    }

    public static function generateAccessToken()
    {
        return Str::random(32);
    }
}
