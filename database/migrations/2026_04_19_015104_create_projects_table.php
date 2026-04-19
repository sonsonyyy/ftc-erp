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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->nullable()->constrained('quotations')->nullOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_site_id')->constrained('customer_sites')->restrictOnDelete();
            $table->string('project_no')->unique();
            $table->string('title');
            $table->string('project_type', 100);
            $table->date('start_date')->nullable()->index();
            $table->date('target_end_date')->nullable();
            $table->date('actual_end_date')->nullable()->index();
            $table->string('status')->default('draft')->index();
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['status', 'start_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
