<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id');
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');
            $table->text('notes')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('expense_categories');
            $table->foreign('created_by')->references('id')->on('users');
            $table->index('expense_date');
            $table->index(['expense_date', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
