<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('purchase_id');
            $table->uuid('supply_id');
            $table->integer('quantity');
            $table->decimal('price_per_unit', 15, 2); // Harga per unit saat beli
            $table->decimal('subtotal', 15, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('purchase_id')->references('id')->on('purchases')->cascadeOnDelete();
            $table->foreign('supply_id')->references('id')->on('supplies');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
