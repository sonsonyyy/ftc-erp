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
        Schema::create('tax_report_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tax_report_run_id')->constrained('tax_report_runs')->cascadeOnDelete();
            $table->string('source_record_type');
            $table->unsignedBigInteger('source_record_id')->nullable();
            $table->string('line_type');
            $table->date('record_date')->nullable();
            $table->string('reference_no')->nullable();
            $table->string('subject_name')->nullable();
            $table->string('subject_tin')->nullable();
            $table->decimal('base_amount', 14, 2)->default(0);
            $table->decimal('amount', 14, 2)->default(0);
            $table->decimal('vat_amount', 14, 2)->default(0);
            $table->decimal('gross_amount', 14, 2)->default(0);
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['source_record_type', 'source_record_id']);
            $table->index(['tax_report_run_id', 'record_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_report_items');
    }
};
