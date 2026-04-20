<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payment_no' => 'PAY-'.fake()->unique()->numerify('######'),
            'customer_id' => Customer::factory(),
            'received_by_user_id' => User::factory(),
            'payment_date' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'amount' => fake()->randomFloat(2, 5_000, 85_000),
            'payment_method' => fake()->randomElement([
                'Cash',
                'Check',
                'Bank Transfer',
                'Online Transfer',
            ]),
            'reference_no' => fake()->boolean(70) ? strtoupper(fake()->bothify('REF-####??')) : null,
            'remarks' => fake()->boolean(40) ? fake()->sentence() : null,
        ];
    }
}
