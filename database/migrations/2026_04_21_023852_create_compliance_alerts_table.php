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
        Schema::create('compliance_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_record_id')->constrained()->cascadeOnDelete();
            $table->string('alert_type');
            $table->string('deadline_type');
            $table->date('scheduled_for');
            $table->date('reference_date');
            $table->unsignedInteger('days_before')->default(0);
            $table->string('message', 500);
            $table->dateTime('acknowledged_at')->nullable();
            $table->foreignId('acknowledged_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique([
                'compliance_record_id',
                'alert_type',
                'deadline_type',
                'scheduled_for',
                'reference_date',
                'days_before',
            ], 'compliance_alerts_unique_alert');
            $table->index(['scheduled_for', 'acknowledged_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_alerts');
    }
};
