<?php

namespace Database\Factories;

use App\Enums\WorkOrderPriority;
use App\Enums\WorkOrderServiceType;
use App\Enums\WorkOrderStatus;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(WorkOrderStatus::cases());
        $scheduledDate = Carbon::instance(fake()->dateTimeBetween('-3 months', '+2 months'))->startOfDay();

        return [
            'quotation_id' => null,
            'project_id' => null,
            'customer_id' => Customer::factory(),
            'customer_site_id' => fn (array $attributes) => CustomerSite::factory()->create([
                'customer_id' => $attributes['customer_id'],
            ])->getKey(),
            'work_order_no' => 'WO-'.fake()->unique()->numerify('#####'),
            'service_type' => fake()->randomElement(WorkOrderServiceType::cases()),
            'scheduled_date' => fake()->boolean(80) ? $scheduledDate->toDateString() : null,
            'priority' => fake()->randomElement(WorkOrderPriority::cases()),
            'status' => $status,
            'summary' => fake()->sentence(4),
            'findings' => fake()->boolean(35) ? fake()->paragraph() : null,
            'completion_date' => in_array($status, [WorkOrderStatus::Completed, WorkOrderStatus::Closed], true)
                ? $scheduledDate->copy()->addDays(fake()->numberBetween(1, 14))->toDateString()
                : null,
        ];
    }
}
