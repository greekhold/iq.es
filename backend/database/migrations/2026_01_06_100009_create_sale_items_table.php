<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sale_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('product_id')->constrained()->onDelete('restrict');
            $table->foreignUuid('price_id')->constrained()->onDelete('restrict');
            $table->decimal('price_snapshot', 15, 2);
            $table->integer('quantity');
            $table->decimal('subtotal', 15, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->index('sale_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
