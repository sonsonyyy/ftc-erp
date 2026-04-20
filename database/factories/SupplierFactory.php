<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'supplier_code' => 'SUP-'.fake()->unique()->numerify('#####'),
            'company_name' => fake()->company(),
            'contact_person' => fake()->boolean(80) ? fake()->name() : null,
            'phone' => fake()->boolean(80) ? fake()->phoneNumber() : null,
            'email' => fake()->boolean(75) ? fake()->companyEmail() : null,
            'tin' => fake()->boolean(60) ? fake()->numerify('###-###-###-###') : null,
            'address' => fake()->boolean(75) ? fake()->address() : null,
            'payment_terms' => fake()->randomElement([
                'Cash on delivery',
                '15 days',
                '30 days',
                '45 days',
            ]),
            'is_active' => fake()->boolean(85),
            'notes' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
