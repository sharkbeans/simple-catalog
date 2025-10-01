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
            $table->string('access_token', 64)->nullable()->after('quotation_number');
            $table->index('access_token');
        });

        // Backfill access tokens for existing quotations
        $quotations = \App\Models\Quotation::whereNull('access_token')->get();
        foreach ($quotations as $quotation) {
            $quotation->access_token = \App\Models\Quotation::generateAccessToken();
            $quotation->save();
        }

        // Make the column unique after backfilling
        Schema::table('quotations', function (Blueprint $table) {
            $table->unique('access_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropUnique(['access_token']);
            $table->dropIndex(['access_token']);
            $table->dropColumn('access_token');
        });
    }
};
