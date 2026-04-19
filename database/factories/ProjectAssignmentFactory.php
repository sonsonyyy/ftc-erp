<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectAssignment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectAssignment>
 */
class ProjectAssignmentFactory extends Factory
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
            'user_id' => User::factory(),
            'assignment_role' => fake()->randomElement([
                'Lead',
                'Coordinator',
                'Support',
            ]),
            'notes' => fake()->boolean(25) ? fake()->sentence() : null,
            'assigned_at' => fake()->dateTimeBetween('-2 months', 'now'),
        ];
    }
}
