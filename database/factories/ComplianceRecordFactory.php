<?php

namespace Database\Factories;

use App\Enums\ComplianceRecordStatus;
use App\Enums\ComplianceRecurrenceUnit;
use App\Models\ComplianceRecord;
use App\Models\ComplianceTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplianceRecord>
 */
class ComplianceRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $deadlineDate = fake()->dateTimeBetween('-30 days', '+90 days');

        return [
            'record_no' => 'CMP-'.fake()->unique()->numerify('#####'),
            'compliance_template_id' => ComplianceTemplate::factory(),
            'title' => fake()->sentence(3),
            'agency' => fake()->randomElement([
                'SEC',
                'PCAB',
                'BIR',
                'Mayor\'s Office',
                'SSS',
                'Pag-IBIG',
                'PhilHealth',
            ]),
            'category' => fake()->randomElement([
                'License',
                'Permit',
                'Tax Filing',
                'Employer Compliance',
            ]),
            'description' => fake()->boolean(70) ? fake()->sentence() : null,
            'due_date' => $deadlineDate,
            'expiry_date' => fake()->boolean(45) ? (clone $deadlineDate)->modify('+30 days') : null,
            'recurrence_unit' => fake()->randomElement([
                ComplianceRecurrenceUnit::None,
                ComplianceRecurrenceUnit::Quarterly,
                ComplianceRecurrenceUnit::Annually,
            ]),
            'reminder_days' => [90, 60, 30, 15, 7],
            'assigned_user_id' => User::factory(),
            'status' => fake()->randomElement([
                ComplianceRecordStatus::Draft,
                ComplianceRecordStatus::Active,
                ComplianceRecordStatus::ForFiling,
                ComplianceRecordStatus::InProgress,
            ]),
            'latest_submission_at' => fake()->boolean(30) ? fake()->dateTimeBetween('-1 year', '-30 days') : null,
            'latest_submission_reference' => fake()->boolean(30) ? 'SUB-'.fake()->numerify('#####') : null,
            'notes' => fake()->boolean(50) ? fake()->sentence() : null,
        ];
    }
}
