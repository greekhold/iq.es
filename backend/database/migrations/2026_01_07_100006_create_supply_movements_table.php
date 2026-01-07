<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('supply_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supply_id');
            $table->enum('movement_type', ['PURCHASE_IN', 'SALE_OUT', 'ADJUSTMENT']);
            $table->integer('quantity'); // Positive for in, negative for out
            $table->integer('balance_after');
            $table->string('reference_type')->nullable(); // App\Models\Purchase, App\Models\Sale
            $table->uuid('reference_id')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('supply_id')->references('id')->on('supplies');
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['supply_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supply_movements');
    }
};
