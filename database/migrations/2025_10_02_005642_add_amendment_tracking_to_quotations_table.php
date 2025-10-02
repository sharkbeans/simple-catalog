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
            // Track when quotation was amended and sent to customer
            $table->timestamp('amended_at')->nullable()->after('reviewed_at');

            // Track original values before amendment for reference
            $table->json('original_values')->nullable()->after('amended_at');

            // Customer's response to amendment
            $table->timestamp('customer_responded_at')->nullable()->after('customer_approved_at');
            $table->text('customer_rejection_reason')->nullable()->after('customer_responded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn(['amended_at', 'original_values', 'customer_responded_at', 'customer_rejection_reason']);
        });
    }
};
