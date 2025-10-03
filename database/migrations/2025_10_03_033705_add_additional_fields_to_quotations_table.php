<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            // Customer's company information
            $table->string('customer_company')->nullable()->after('customer_name');

            // Separate delivery address from customer address
            $table->text('delivery_address')->nullable()->after('customer_address');

            // Additional requirements/notes from customer
            $table->text('additional_requirements')->nullable()->after('notes');

            // Preferred response timeline
            $table->string('preferred_response_timeline')->nullable()->after('additional_requirements');

            // Priority indicator for admin (low, medium, high, urgent)
            $table->string('priority')->default('medium')->after('status');

            // Discount fields
            $table->string('discount_type')->nullable()->after('tax'); // 'percentage' or 'fixed'
            $table->decimal('discount_value', 10, 2)->default(0)->after('discount_type');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_value');

            // Additional charges
            $table->decimal('shipping_charges', 10, 2)->default(0)->after('discount_amount');
            $table->decimal('handling_charges', 10, 2)->default(0)->after('shipping_charges');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn([
                'customer_company',
                'delivery_address',
                'additional_requirements',
                'preferred_response_timeline',
                'priority',
                'discount_type',
                'discount_value',
                'discount_amount',
                'shipping_charges',
                'handling_charges'
            ]);
        });
    }
};
