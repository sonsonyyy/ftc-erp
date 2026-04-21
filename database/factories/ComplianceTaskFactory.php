<?php

namespace Database\Factories;

use App\Enums\ComplianceTaskStatus;
use App\Models\ComplianceRecord;
use App\Models\ComplianceTask;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplianceTask>
 */
class ComplianceTaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'compliance_record_id' => ComplianceRecord::factory(),
            'title' => fake()->sentence(4),
            'due_date' => fake()->boolean(70) ? fake()->dateTimeBetween('-15 days', '+45 days') : null,
            'assigned_user_id' => fake()->boolean(60) ? User::factory() : null,
            'status' => fake()->randomElement([
                ComplianceTaskStatus::Open,
                ComplianceTaskStatus::Completed,
            ]),
            'completed_at' => fake()->boolean(30) ? fake()->dateTimeBetween('-15 days', 'now') : null,
            'notes' => fake()->boolean(50) ? fake()->sentence() : null,
        ];
    }
}
