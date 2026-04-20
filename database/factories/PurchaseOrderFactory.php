<?php

namespace Database\Factories;

use App\Enums\PurchaseOrderStatus;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseRequest;
use App\Models\Supplier;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'po_no' => 'PO-'.fake()->unique()->numerify('#####'),
            'purchase_request_id' => fake()->boolean(70) ? PurchaseRequest::factory() : null,
            'supplier_id' => Supplier::factory(),
            'project_id' => fake()->boolean(60) ? Project::factory() : null,
            'work_order_id' => fake()->boolean(30) ? WorkOrder::factory() : null,
            'ordered_by_user_id' => User::factory(),
            'order_date' => fake()->dateTimeBetween('-1 month', 'now'),
            'expected_date' => fake()->boolean(70) ? fake()->dateTimeBetween('now', '+1 month') : null,
            'status' => fake()->randomElement([
                PurchaseOrderStatus::Draft,
                PurchaseOrderStatus::Submitted,
                PurchaseOrderStatus::Approved,
            ]),
            'supplier_reference' => fake()->boolean(50) ? fake()->bothify('SUP-REF-###') : null,
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
