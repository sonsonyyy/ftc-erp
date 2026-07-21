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
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['company_name', 'status']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('created_by')
                ->nullable()
                ->after('customer_code')
                ->constrained('users')
                ->nullOnDelete();

            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('status')->default('active')->index();
            $table->index(['company_name', 'status']);
            $table->dropConstrainedForeignId('created_by');
        });
    }
};
