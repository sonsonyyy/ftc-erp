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
        Schema::create('vat_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_type');
            $table->string('source_type');
            $table->unsignedBigInteger('source_id');
            $table->date('record_date');
            $table->string('reference_no')->nullable();
            $table->string('counterparty_name');
            $table->string('counterparty_tin')->nullable();
            $table->decimal('net_amount', 14, 2)->default(0);
            $table->decimal('vat_amount', 14, 2)->default(0);
            $table->decimal('gross_amount', 14, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['source_type', 'source_id', 'record_type']);
            $table->index(['record_type', 'record_date']);
            $table->index(['record_date', 'source_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vat_records');
    }
};
