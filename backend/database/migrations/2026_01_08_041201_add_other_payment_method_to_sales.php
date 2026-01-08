<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, recreate table with updated CHECK constraint to include OTHER
        DB::statement('CREATE TABLE sales_new (
            "id" varchar not null,
            "invoice_number" varchar not null,
            "customer_id" varchar,
            "sales_channel" varchar check ("sales_channel" in (\'FACTORY\', \'FIELD\')) not null,
            "payment_method" varchar check ("payment_method" in (\'CASH\', \'TRANSFER\', \'OTHER\')) not null,
            "total_amount" numeric not null,
            "status" varchar check ("status" in (\'pending\', \'completed\', \'cancelled\')) not null default \'completed\',
            "sync_status" varchar check ("sync_status" in (\'pending\', \'synced\', \'conflict\')) not null default \'synced\',
            "created_by" varchar not null,
            "sold_at" datetime not null,
            "created_at" datetime,
            "updated_at" datetime,
            "due_date" date,
            "payment_status" varchar check ("payment_status" in (\'paid\', \'unpaid\', \'overdue\')) not null default \'paid\',
            primary key ("id")
        )');

        // Copy data
        DB::statement('INSERT INTO sales_new SELECT * FROM sales');

        // Drop old table
        Schema::dropIfExists('sales');

        // Rename new table
        DB::statement('ALTER TABLE sales_new RENAME TO sales');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('CREATE TABLE sales_old (
            "id" varchar not null,
            "invoice_number" varchar not null,
            "customer_id" varchar,
            "sales_channel" varchar check ("sales_channel" in (\'FACTORY\', \'FIELD\')) not null,
            "payment_method" varchar check ("payment_method" in (\'CASH\', \'TRANSFER\')) not null,
            "total_amount" numeric not null,
            "status" varchar check ("status" in (\'pending\', \'completed\', \'cancelled\')) not null default \'completed\',
            "sync_status" varchar check ("sync_status" in (\'pending\', \'synced\', \'conflict\')) not null default \'synced\',
            "created_by" varchar not null,
            "sold_at" datetime not null,
            "created_at" datetime,
            "updated_at" datetime,
            "due_date" date,
            "payment_status" varchar check ("payment_status" in (\'paid\', \'unpaid\', \'overdue\')) not null default \'paid\',
            primary key ("id")
        )');

        DB::statement('INSERT INTO sales_old SELECT * FROM sales WHERE payment_method != \'OTHER\'');

        Schema::dropIfExists('sales');

        DB::statement('ALTER TABLE sales_old RENAME TO sales');
    }
};
