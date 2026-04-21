<?php

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
        Schema::create('compliance_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('agency');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('default_recurrence_unit')->default(ComplianceRecurrenceUnit::None->value);
            $table->json('default_reminder_days')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['agency', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_templates');
    }
};
