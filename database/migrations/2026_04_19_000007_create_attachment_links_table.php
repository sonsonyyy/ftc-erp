<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('attachment_links')) {
            if (! Schema::hasIndex('attachment_links', ['attachment_id', 'attachable_type', 'attachable_id'], 'unique')) {
                Schema::table('attachment_links', function (Blueprint $table) {
                    $table->unique(['attachment_id', 'attachable_type', 'attachable_id']);
                });
            }

            return;
        }

        Schema::create('attachment_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attachment_id')->constrained()->cascadeOnDelete();
            $table->morphs('attachable');
            $table->timestamps();

            $table->unique(['attachment_id', 'attachable_type', 'attachable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachment_links');
    }
};
