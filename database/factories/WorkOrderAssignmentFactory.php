<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderAssignment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkOrderAssignment>
 */
class WorkOrderAssignmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'work_order_id' => WorkOrder::factory(),
            'user_id' => User::factory(),
            'assignment_role' => fake()->randomElement([
                'Technician',
                'Lead Technician',
                'Coordinator',
            ]),
            'notes' => fake()->boolean(25) ? fake()->sentence() : null,
            'assigned_at' => fake()->dateTimeBetween('-2 months', 'now'),
        ];
    }
}
