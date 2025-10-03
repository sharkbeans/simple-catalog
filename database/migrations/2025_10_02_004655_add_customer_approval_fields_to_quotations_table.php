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
            // Store customer's IP address when they approve
            if (!Schema::hasColumn('quotations', 'customer_ip')) {
                $table->string('customer_ip')->nullable()->after('customer_approved_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            if (Schema::hasColumn('quotations', 'customer_ip')) {
                $table->dropColumn('customer_ip');
            }
        });
    }
};
