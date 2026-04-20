<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Position>
 */
class PositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => fake()->boolean(80) ? Department::factory() : null,
            'title' => fake()->unique()->jobTitle(),
            'description' => fake()->boolean(60) ? fake()->sentence() : null,
            'is_active' => fake()->boolean(85),
        ];
    }
}
