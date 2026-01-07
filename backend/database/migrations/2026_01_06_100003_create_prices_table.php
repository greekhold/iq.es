<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained()->onDelete('cascade');
            $table->decimal('price', 15, 2);
            $table->enum('sales_channel', ['FACTORY', 'FIELD', 'ALL'])->default('ALL');
            $table->boolean('is_active')->default(true);
            $table->timestamp('valid_from')->useCurrent();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'is_active', 'sales_channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prices');
    }
};
