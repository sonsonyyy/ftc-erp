<?php

namespace Database\Factories;

use App\Enums\ComplianceAlertType;
use App\Models\ComplianceAlert;
use App\Models\ComplianceRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplianceAlert>
 */
class ComplianceAlertFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $scheduledFor = fake()->dateTimeBetween('-5 days', '+5 days');
        $alertType = fake()->randomElement(ComplianceAlertType::cases());

        return [
            'compliance_record_id' => ComplianceRecord::factory(),
            'alert_type' => $alertType,
            'deadline_type' => $alertType->deadlineType(),
            'scheduled_for' => $scheduledFor,
            'reference_date' => (clone $scheduledFor)->modify('+7 days'),
            'days_before' => in_array($alertType, [
                ComplianceAlertType::DueReminder,
                ComplianceAlertType::ExpiryReminder,
            ], true) ? fake()->randomElement([90, 60, 30, 15, 7]) : 0,
            'message' => fake()->sentence(),
            'acknowledged_at' => fake()->boolean(30) ? fake()->dateTimeBetween('-3 days', 'now') : null,
            'acknowledged_by_user_id' => fake()->boolean(30) ? User::factory() : null,
        ];
    }
}
