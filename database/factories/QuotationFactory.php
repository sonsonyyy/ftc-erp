<?php

namespace Database\Factories;

use App\Enums\QuotationStatus;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Quotation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Quotation>
 */
class QuotationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(QuotationStatus::cases());
        $quotationDate = Carbon::instance(fake()->dateTimeBetween('-6 months', 'now'))->startOfDay();

        return [
            'customer_id' => Customer::factory(),
            'customer_site_id' => fake()->boolean(60)
                ? fn (array $attributes) => CustomerSite::factory()->create([
                    'customer_id' => $attributes['customer_id'],
                ])->getKey()
                : null,
            'quotation_no' => 'QTN-'.fake()->unique()->numerify('#####'),
            'subject' => fake()->sentence(4),
            'quotation_date' => $quotationDate->toDateString(),
            'valid_until' => fake()->boolean(80)
                ? $quotationDate->copy()->addDays(fake()->numberBetween(7, 45))->toDateString()
                : null,
            'quotation_amount' => fake()->randomFloat(2, 10_000, 2_500_000),
            'status' => $status,
            'prepared_by_user_id' => fake()->boolean(60) ? User::factory() : null,
            'assigned_sales_user_id' => fake()->boolean(75) ? User::factory() : null,
            'materialized_at' => $status === QuotationStatus::Awarded
                ? $quotationDate->copy()->addDays(fake()->numberBetween(1, 30))
                : null,
            'converted_project_id' => null,
            'converted_work_order_id' => null,
            'lost_reason' => $status === QuotationStatus::Lost
                ? fake()->randomElement([
                    'Client budget constraints',
                    'Competitor won the bid',
                    'Scope changed after submission',
                ])
                : null,
            'remarks' => fake()->boolean(35) ? fake()->sentence() : null,
        ];
    }
}
