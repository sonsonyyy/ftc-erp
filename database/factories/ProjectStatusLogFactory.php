<?php

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\ProjectStatusLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectStatusLog>
 */
class ProjectStatusLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'from_status' => null,
            'to_status' => ProjectStatus::Draft,
            'changed_by' => User::factory(),
            'remarks' => fake()->sentence(),
            'changed_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
