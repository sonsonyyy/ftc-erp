<?php

namespace Database\Factories;

use App\Models\StockIssuance;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<StockIssuance>
 */
class StockIssuanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'issuance_no' => 'ISS-'.fake()->unique()->numerify('#####'),
            'warehouse_id' => Warehouse::factory(),
            'project_id' => null,
            'work_order_id' => null,
            'issued_date' => Carbon::instance(fake()->dateTimeBetween('-2 months', 'now'))->toDateString(),
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
            'created_by' => User::factory(),
        ];
    }
}
