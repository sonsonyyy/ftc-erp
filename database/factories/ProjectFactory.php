<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(ProjectStatus::cases());
        $startDate = Carbon::instance(fake()->dateTimeBetween('-6 months', 'now'))->startOfDay();

        return [
            'quotation_id' => null,
            'customer_id' => Customer::factory(),
            'customer_site_id' => fn (array $attributes) => CustomerSite::factory()->create([
                'customer_id' => $attributes['customer_id'],
            ])->getKey(),
            'project_no' => 'PRJ-'.fake()->unique()->numerify('#####'),
            'title' => fake()->sentence(4),
            'project_type' => fake()->randomElement([
                'Installation',
                'Upgrade',
                'Corrective Work',
                'Contract Job',
            ]),
            'start_date' => fake()->boolean(85) ? $startDate->toDateString() : null,
            'target_end_date' => fake()->boolean(70)
                ? $startDate->copy()->addDays(fake()->numberBetween(7, 90))->toDateString()
                : null,
            'actual_end_date' => $status === ProjectStatus::Completed
                ? $startDate->copy()->addDays(fake()->numberBetween(10, 120))->toDateString()
                : null,
            'status' => $status,
            'description' => fake()->boolean(35) ? fake()->paragraph() : null,
        ];
    }
}
