<?php

namespace Database\Factories;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Warehouse>
 */
class WarehouseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'warehouse_code' => 'WH-'.fake()->unique()->numerify('###'),
            'warehouse_name' => fake()->company().' Warehouse',
            'address' => fake()->address(),
            'contact_person' => fake()->name(),
            'contact_no' => fake()->phoneNumber(),
            'is_active' => fake()->boolean(85),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
