<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 8_000, 75_000);
        $taxAmount = fake()->boolean(75)
            ? round($subtotal * 0.12, 2)
            : 0;
        $totalAmount = round($subtotal + $taxAmount, 2);

        return [
            'invoice_no' => 'INV-'.fake()->unique()->numerify('######'),
            'quotation_id' => null,
            'customer_id' => Customer::factory(),
            'project_id' => null,
            'work_order_id' => null,
            'issued_by_user_id' => User::factory(),
            'invoice_date' => fake()->dateTimeBetween('-60 days', 'now')->format('Y-m-d'),
            'due_date' => fake()->dateTimeBetween('now', '+45 days')->format('Y-m-d'),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'balance_amount' => $totalAmount,
            'status' => InvoiceStatus::Issued,
            'remarks' => fake()->boolean(60) ? fake()->sentence() : null,
        ];
    }
}
