<?php

namespace Database\Factories;

use App\Enums\EmploymentStatus;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_no' => 'EMP-'.fake()->unique()->numerify('#####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'middle_name' => fake()->boolean(55) ? fake()->firstName() : null,
            'department_id' => null,
            'position_id' => null,
            'employment_status' => fake()->randomElement(EmploymentStatus::cases()),
            'hire_date' => fake()->boolean(85) ? fake()->dateTimeBetween('-6 years', 'now') : null,
            'basic_salary' => fake()->boolean(90) ? fake()->randomFloat(2, 18000, 60000) : null,
            'tin' => fake()->boolean(70) ? fake()->numerify('###-###-###-###') : null,
            'sss_no' => fake()->boolean(70) ? fake()->numerify('##-#######-#') : null,
            'pagibig_no' => fake()->boolean(70) ? fake()->numerify('####-####-####') : null,
            'philhealth_no' => fake()->boolean(70) ? fake()->numerify('##-#########-#') : null,
            'email' => fake()->boolean(80) ? fake()->unique()->safeEmail() : null,
            'phone' => fake()->boolean(75) ? fake()->phoneNumber() : null,
            'address' => fake()->boolean(70) ? fake()->address() : null,
            'is_active' => fake()->boolean(85),
        ];
    }
}
