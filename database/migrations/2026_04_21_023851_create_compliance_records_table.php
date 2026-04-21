<?php

use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
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
        Schema::create('compliance_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_no')->unique();
            $table->foreignId('compliance_template_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('agency');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('recurrence_unit')->default(ComplianceRecurrenceUnit::None->value);
            $table->json('reminder_days')->nullable();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default(ComplianceRecordStatus::Draft->value);
            $table->date('latest_submission_at')->nullable();
            $table->string('latest_submission_reference')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'agency']);
            $table->index(['assigned_user_id', 'status']);
            $table->index('due_date');
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_records');
    }
};
