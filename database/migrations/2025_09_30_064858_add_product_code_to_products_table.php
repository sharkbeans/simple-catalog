<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_code')->nullable()->after('id');
        });

        // Set product_code for existing products in STP-001 format
        // Using SQLite compatible syntax
        $products = DB::table('products')->whereNull('product_code')->get();
        foreach ($products as $product) {
            DB::table('products')
                ->where('id', $product->id)
                ->update(['product_code' => 'STP-' . str_pad($product->id, 3, '0', STR_PAD_LEFT)]);
        }

        // Make product_code unique and not nullable after populating
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_code')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['product_code']);
            $table->dropColumn('product_code');
        });
    }
};
