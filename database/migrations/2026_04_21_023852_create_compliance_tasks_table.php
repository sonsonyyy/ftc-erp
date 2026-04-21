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
        Schema::create('compliance_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_record_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->date('due_date')->nullable();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('open');
            $table->dateTime('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['compliance_record_id', 'status']);
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_tasks');
    }
};
