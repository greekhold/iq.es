<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table with new enum values
        // Create a temporary table with the new structure (9 columns matching existing)
        DB::statement('CREATE TABLE supply_movements_new (
            id VARCHAR PRIMARY KEY,
            supply_id VARCHAR NOT NULL,
            movement_type VARCHAR CHECK(movement_type IN ("PURCHASE_IN", "SALE_OUT", "ADJUSTMENT", "PRODUCTION_OUT")) NOT NULL,
            quantity INTEGER NOT NULL,
            balance_after INTEGER NOT NULL,
            reference_type VARCHAR,
            reference_id VARCHAR,
            created_by VARCHAR,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');

        // Copy data from old table
        DB::statement('INSERT INTO supply_movements_new SELECT * FROM supply_movements');

        // Drop old table
        Schema::dropIfExists('supply_movements');

        // Rename new table
        DB::statement('ALTER TABLE supply_movements_new RENAME TO supply_movements');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert if needed - recreate with original enum values
        DB::statement('CREATE TABLE supply_movements_old (
            id VARCHAR PRIMARY KEY,
            supply_id VARCHAR NOT NULL,
            movement_type VARCHAR CHECK(movement_type IN ("PURCHASE_IN", "SALE_OUT", "ADJUSTMENT")) NOT NULL,
            quantity INTEGER NOT NULL,
            balance_after INTEGER NOT NULL,
            reference_type VARCHAR,
            reference_id VARCHAR,
            created_by VARCHAR,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('INSERT INTO supply_movements_old SELECT * FROM supply_movements WHERE movement_type != "PRODUCTION_OUT"');

        Schema::dropIfExists('supply_movements');

        DB::statement('ALTER TABLE supply_movements_old RENAME TO supply_movements');
    }
};
