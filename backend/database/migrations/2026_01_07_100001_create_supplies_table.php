<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('supplies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Plastik Es Kristal, Tutup Galon, Galon
            $table->string('sku')->unique();
            $table->string('unit')->default('pcs'); // pcs, pack, roll
            $table->integer('current_stock')->default(0);
            $table->integer('min_stock')->default(10); // Minimum stock warning
            $table->uuid('linked_product_id')->nullable(); // Link to product for auto-deduct
            $table->integer('deduct_per_sale')->default(1); // How many to deduct per product sale
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('linked_product_id')->references('id')->on('products')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplies');
    }
};
