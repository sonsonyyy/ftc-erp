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
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->nullable()->constrained('quotations')->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_site_id')->constrained('customer_sites')->restrictOnDelete();
            $table->string('work_order_no')->unique();
            $table->string('service_type')->index();
            $table->date('scheduled_date')->nullable()->index();
            $table->string('priority')->default('normal')->index();
            $table->string('status')->default('draft')->index();
            $table->string('summary');
            $table->text('findings')->nullable();
            $table->date('completion_date')->nullable()->index();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['project_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
