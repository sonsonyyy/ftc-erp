<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const UNIQUE_INDEX_NAME = 'pr_items_receipt_order_unique';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('purchase_receipt_items')) {
            if (! Schema::hasIndex('purchase_receipt_items', ['purchase_receipt_id', 'purchase_order_item_id'], 'unique')) {
                Schema::table('purchase_receipt_items', function (Blueprint $table) {
                    $table->unique(
                        ['purchase_receipt_id', 'purchase_order_item_id'],
                        self::UNIQUE_INDEX_NAME,
                    );
                });
            }

            return;
        }

        Schema::create('purchase_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_receipt_id')->constrained('purchase_receipts')->cascadeOnDelete();
            $table->foreignId('purchase_order_item_id')->constrained('purchase_order_items')->restrictOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->decimal('received_quantity', 12, 2);
            $table->decimal('unit_cost', 12, 2);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(
                ['purchase_receipt_id', 'purchase_order_item_id'],
                self::UNIQUE_INDEX_NAME,
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_receipt_items');
    }
};
