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
        Schema::create('compliance_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_record_id')->constrained()->cascadeOnDelete();
            $table->string('reference_no')->nullable();
            $table->date('submitted_at');
            $table->foreignId('submitted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('due_date_snapshot')->nullable();
            $table->date('expiry_date_snapshot')->nullable();
            $table->date('next_due_date')->nullable();
            $table->date('next_expiry_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['compliance_record_id', 'submitted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_submissions');
    }
};
