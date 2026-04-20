<?php

namespace Database\Factories;

use App\Enums\TaxCertificateType;
use App\Models\TaxCertificate;
use App\Models\TaxReportRun;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaxCertificate>
 */
class TaxCertificateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grossAmount = fake()->randomFloat(2, 1000, 120000);

        return [
            'certificate_type' => fake()->randomElement(TaxCertificateType::cases()),
            'certificate_no' => fake()->boolean(80) ? fake()->unique()->bothify('CERT-######') : null,
            'tax_report_run_id' => fake()->boolean(70) ? TaxReportRun::factory() : null,
            'period_from' => fake()->dateTimeBetween('-6 months', '-2 months'),
            'period_to' => fake()->dateTimeBetween('-2 months', 'now'),
            'issued_at' => fake()->dateTimeBetween('-2 months', 'now'),
            'gross_amount' => $grossAmount,
            'tax_amount' => round($grossAmount * fake()->randomFloat(2, 0.01, 0.1), 2),
            'payload' => [],
        ];
    }
}
