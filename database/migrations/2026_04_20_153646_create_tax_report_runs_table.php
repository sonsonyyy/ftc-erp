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
        Schema::create('tax_report_runs', function (Blueprint $table) {
            $table->id();
            $table->string('report_no')->unique();
            $table->string('report_type');
            $table->date('period_from');
            $table->date('period_to');
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at')->nullable();
            $table->unsignedInteger('item_count')->default(0);
            $table->decimal('base_amount_total', 14, 2)->default(0);
            $table->decimal('amount_total', 14, 2)->default(0);
            $table->decimal('vat_amount_total', 14, 2)->default(0);
            $table->decimal('gross_amount_total', 14, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['report_type', 'period_from', 'period_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_report_runs');
    }
};
