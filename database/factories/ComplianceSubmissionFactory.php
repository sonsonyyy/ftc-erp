<?php

namespace Database\Factories;

use App\Models\ComplianceRecord;
use App\Models\ComplianceSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplianceSubmission>
 */
class ComplianceSubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $submittedAt = fake()->dateTimeBetween('-1 year', 'now');

        return [
            'compliance_record_id' => ComplianceRecord::factory(),
            'reference_no' => 'SUB-'.fake()->unique()->numerify('#####'),
            'submitted_at' => $submittedAt,
            'submitted_by_user_id' => User::factory(),
            'due_date_snapshot' => fake()->boolean(60) ? (clone $submittedAt)->modify('+7 days') : null,
            'expiry_date_snapshot' => fake()->boolean(40) ? (clone $submittedAt)->modify('+30 days') : null,
            'next_due_date' => fake()->boolean(60) ? (clone $submittedAt)->modify('+90 days') : null,
            'next_expiry_date' => fake()->boolean(40) ? (clone $submittedAt)->modify('+1 year') : null,
            'remarks' => fake()->boolean(50) ? fake()->sentence() : null,
        ];
    }
}
