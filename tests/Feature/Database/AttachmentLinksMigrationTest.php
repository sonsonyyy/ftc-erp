<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('attachment links migration is safe when the table already exists', function () {
    expect(Schema::hasTable('attachment_links'))->toBeTrue();

    $migration = require database_path('migrations/2026_04_19_000007_create_attachment_links_table.php');

    $migration->up();

    expect(Schema::hasTable('attachment_links'))->toBeTrue();
    expect(Schema::hasIndex('attachment_links', ['attachment_id', 'attachable_type', 'attachable_id'], 'unique'))->toBeTrue();
});
