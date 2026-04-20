<?php

namespace App\Models;

use App\Enums\EmploymentStatus;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'employee_no',
    'first_name',
    'last_name',
    'middle_name',
    'department_id',
    'position_id',
    'employment_status',
    'hire_date',
    'basic_salary',
    'tin',
    'sss_no',
    'pagibig_no',
    'philhealth_no',
    'email',
    'phone',
    'address',
    'is_active',
])]
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'employment_status' => EmploymentStatus::Regular->value,
        'is_active' => true,
    ];

    /**
     * Get the department assigned to the employee.
     *
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class)->withTrashed();
    }

    /**
     * Get the position assigned to the employee.
     *
     * @return BelongsTo<Position, $this>
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class)->withTrashed();
    }

    /**
     * Get payroll entries recorded for the employee.
     *
     * @return HasMany<PayrollEntry, $this>
     */
    public function payrollEntries(): HasMany
    {
        return $this->hasMany(PayrollEntry::class)->orderByDesc('id');
    }

    /**
     * Scope a query to search employee records.
     *
     * @param  Builder<Employee>  $query
     * @return Builder<Employee>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('employee_no', 'like', "%{$term}%")
                ->orWhere('first_name', 'like', "%{$term}%")
                ->orWhere('last_name', 'like', "%{$term}%")
                ->orWhere('middle_name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->orWhere('phone', 'like', "%{$term}%")
                ->orWhere('tin', 'like', "%{$term}%")
                ->orWhere('sss_no', 'like', "%{$term}%")
                ->orWhere('pagibig_no', 'like', "%{$term}%")
                ->orWhere('philhealth_no', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by department.
     *
     * @param  Builder<Employee>  $query
     * @return Builder<Employee>
     */
    public function scopeForDepartment(Builder $query, ?int $departmentId): Builder
    {
        return filled($departmentId)
            ? $query->where('department_id', $departmentId)
            : $query;
    }

    /**
     * Scope a query to filter by position.
     *
     * @param  Builder<Employee>  $query
     * @return Builder<Employee>
     */
    public function scopeForPosition(Builder $query, ?int $positionId): Builder
    {
        return filled($positionId)
            ? $query->where('position_id', $positionId)
            : $query;
    }

    /**
     * Scope a query to filter by employment status.
     *
     * @param  Builder<Employee>  $query
     * @return Builder<Employee>
     */
    public function scopeEmploymentStatus(Builder $query, ?string $employmentStatus): Builder
    {
        return filled($employmentStatus)
            ? $query->where('employment_status', $employmentStatus)
            : $query;
    }

    /**
     * Scope a query to filter by activity state.
     *
     * @param  Builder<Employee>  $query
     * @return Builder<Employee>
     */
    public function scopeActive(Builder $query, ?string $active): Builder
    {
        return match ($active) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => $query,
        };
    }

    /**
     * Resolve the employee's full name.
     */
    public function fullName(): string
    {
        return collect([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ])->filter()->implode(' ');
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'employment_status' => EmploymentStatus::class,
            'hire_date' => 'date',
            'basic_salary' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
