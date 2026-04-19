<?php

namespace Database\Factories;

use App\Enums\WorkOrderLogType;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkOrderLog>
 */
class WorkOrderLogFactory extends Factory
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
            'log_type' => WorkOrderLogType::Note,
            'from_status' => null,
            'to_status' => null,
            'details' => fake()->sentence(),
            'logged_by' => User::factory(),
            'logged_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
