<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Modify users table to add role_id and additional fields
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('role_id')->nullable()->after('id')->constrained()->onDelete('restrict');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('password');
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'status', 'last_login_at']);
        });
    }
};
