<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\CustomerSite;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerSite>
 */
class CustomerSiteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'site_code' => 'SITE-'.fake()->unique()->numerify('#####'),
            'site_name' => fake()->company().' Site',
            'contact_person' => fake()->boolean(70) ? fake()->name() : null,
            'contact_no' => fake()->boolean(80) ? fake()->phoneNumber() : null,
            'email' => fake()->boolean(65) ? fake()->safeEmail() : null,
            'address' => fake()->address(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'notes' => fake()->boolean(25) ? fake()->sentence() : null,
            'is_active' => fake()->boolean(85),
        ];
    }
}
