<?php

namespace Database\Factories;

use App\Enums\ComplianceRecurrenceUnit;
use App\Models\ComplianceTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComplianceTemplate>
 */
class ComplianceTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company().' Filing',
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
            'default_recurrence_unit' => fake()->randomElement([
                ComplianceRecurrenceUnit::Quarterly,
                ComplianceRecurrenceUnit::Annually,
            ]),
            'default_reminder_days' => [90, 60, 30, 15, 7],
            'is_active' => true,
        ];
    }
}
