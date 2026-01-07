<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->string('supplier_name')->nullable(); // Nama supplier/toko
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->date('purchased_at');
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users');
            $table->index('purchased_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
