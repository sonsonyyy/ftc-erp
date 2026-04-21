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
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->timestamp('submitted_at')->nullable()->after('remarks');
            $table->foreignId('submitted_by_user_id')->nullable()->after('submitted_at')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('submitted_by_user_id');
            $table->foreignId('approved_by_user_id')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            $table->text('approval_notes')->nullable()->after('approved_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('submitted_by_user_id');
            $table->dropConstrainedForeignId('approved_by_user_id');
            $table->dropColumn([
                'submitted_at',
                'approved_at',
                'approval_notes',
            ]);
        });
    }
};
