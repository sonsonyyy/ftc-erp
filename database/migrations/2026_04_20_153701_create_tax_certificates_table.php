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
        Schema::create('tax_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_type');
            $table->string('certificate_no')->nullable()->unique();
            $table->nullableMorphs('certifiable');
            $table->foreignId('tax_report_run_id')->nullable()->constrained('tax_report_runs')->nullOnDelete();
            $table->date('period_from')->nullable();
            $table->date('period_to')->nullable();
            $table->date('issued_at')->nullable();
            $table->decimal('gross_amount', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->json('payload')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['certificate_type', 'issued_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_certificates');
    }
};
