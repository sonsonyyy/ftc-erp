<?php

namespace Database\Factories;

use App\Enums\CustomerStatus;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_code' => 'CUST-'.fake()->unique()->numerify('#####'),
            'company_name' => fake()->company(),
            'trade_name' => fake()->boolean(60) ? fake()->companySuffix() : null,
            'tin' => fake()->boolean(70) ? fake()->numerify('###-###-###-###') : null,
            'phone' => fake()->boolean(80) ? fake()->phoneNumber() : null,
            'email' => fake()->boolean(70) ? fake()->companyEmail() : null,
            'billing_address' => fake()->boolean(75) ? fake()->address() : null,
            'status' => fake()->randomElement(CustomerStatus::cases()),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
