<?php

namespace Database\Factories;

use App\Models\StockReturn;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<StockReturn>
 */
class StockReturnFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'return_no' => 'RET-'.fake()->unique()->numerify('#####'),
            'warehouse_id' => Warehouse::factory(),
            'project_id' => null,
            'work_order_id' => null,
            'returned_date' => Carbon::instance(fake()->dateTimeBetween('-2 months', 'now'))->toDateString(),
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
            'created_by' => User::factory(),
        ];
    }
}
