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
            // Add customer email field if it doesn't exist
            if (!Schema::hasColumn('quotations', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_contact');
            }

            // Add admin notes field if it doesn't exist
            if (!Schema::hasColumn('quotations', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('notes');
            }

            // Add customer_approved_at if it doesn't exist (for approval workflow)
            if (!Schema::hasColumn('quotations', 'customer_approved_at')) {
                $table->timestamp('customer_approved_at')->nullable()->after('admin_notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            if (Schema::hasColumn('quotations', 'customer_email')) {
                $table->dropColumn('customer_email');
            }
            if (Schema::hasColumn('quotations', 'admin_notes')) {
                $table->dropColumn('admin_notes');
            }
            if (Schema::hasColumn('quotations', 'customer_approved_at')) {
                $table->dropColumn('customer_approved_at');
            }
        });
    }
};
