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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_site_id')->nullable()->constrained('customer_sites')->nullOnDelete();
            $table->string('quotation_no')->unique();
            $table->string('subject');
            $table->date('quotation_date')->index();
            $table->date('valid_until')->nullable();
            $table->decimal('quotation_amount', 15, 2);
            $table->string('status')->default('draft')->index();
            $table->foreignId('prepared_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_sales_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('materialized_at')->nullable()->index();
            $table->unsignedBigInteger('converted_project_id')->nullable()->index();
            $table->unsignedBigInteger('converted_work_order_id')->nullable()->index();
            $table->text('lost_reason')->nullable();
            $table->text('remarks')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['status', 'quotation_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
