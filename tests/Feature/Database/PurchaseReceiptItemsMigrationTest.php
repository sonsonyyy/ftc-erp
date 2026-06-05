<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('purchase receipt items migration is safe when the table already exists', function () {
    $uniqueIndexName = 'pr_items_receipt_order_unique';

    expect(Schema::hasTable('purchase_receipt_items'))->toBeTrue();
    expect(strlen($uniqueIndexName))->toBeLessThanOrEqual(64);

    $migration = require database_path('migrations/2026_04_20_041641_create_purchase_receipt_items_table.php');

    $migration->up();

    expect(Schema::hasTable('purchase_receipt_items'))->toBeTrue();
    expect(Schema::hasIndex('purchase_receipt_items', ['purchase_receipt_id', 'purchase_order_item_id'], 'unique'))->toBeTrue();
});
