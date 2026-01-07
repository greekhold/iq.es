<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number', 50)->unique();
            $table->foreignUuid('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('sales_channel', ['FACTORY', 'FIELD']);
            $table->enum('payment_method', ['CASH', 'TRANSFER']);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->enum('sync_status', ['pending', 'synced', 'conflict'])->default('synced');
            $table->foreignUuid('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('sold_at');
            $table->timestamps();

            $table->index(['sales_channel', 'sold_at']);
            $table->index(['created_by', 'sold_at']);
            $table->index('sync_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
