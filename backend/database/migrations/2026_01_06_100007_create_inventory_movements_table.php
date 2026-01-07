<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained()->onDelete('restrict');
            $table->enum('movement_type', ['PRODUCTION_IN', 'SALE_FACTORY', 'SALE_FIELD', 'ADJUSTMENT', 'RETURN']);
            $table->integer('quantity');
            $table->integer('balance_after');
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type', 100)->nullable();
            $table->foreignUuid('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['product_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
