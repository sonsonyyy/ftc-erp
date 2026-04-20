<?php

namespace Database\Factories;

use App\Enums\PurchaseRequestStatus;
use App\Models\Project;
use App\Models\PurchaseRequest;
use App\Models\Supplier;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseRequest>
 */
class PurchaseRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_no' => 'PR-'.fake()->unique()->numerify('#####'),
            'supplier_id' => fake()->boolean(70) ? Supplier::factory() : null,
            'project_id' => fake()->boolean(60) ? Project::factory() : null,
            'work_order_id' => fake()->boolean(30) ? WorkOrder::factory() : null,
            'requested_by_user_id' => User::factory(),
            'request_date' => fake()->dateTimeBetween('-2 months', 'now'),
            'needed_by' => fake()->boolean(70) ? fake()->dateTimeBetween('now', '+1 month') : null,
            'status' => fake()->randomElement([
                PurchaseRequestStatus::Draft,
                PurchaseRequestStatus::Submitted,
            ]),
            'purpose' => fake()->sentence(4),
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
