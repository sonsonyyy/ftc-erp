<?php

namespace App\Models;

use Database\Factories\PositionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['department_id', 'title', 'description', 'is_active'])]
class Position extends Model
{
    /** @use HasFactory<PositionFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * Get the parent department.
     *
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class)->withTrashed();
    }

    /**
     * Get employees assigned to this position.
     *
     * @return HasMany<Employee, $this>
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class)
            ->orderBy('last_name')
            ->orderBy('first_name');
    }

    /**
     * Scope a query to search position records.
     *
     * @param  Builder<Position>  $query
     * @return Builder<Position>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        $operator = $query->getConnection()->getDriverName() === 'pgsql'
            ? 'ilike'
            : 'like';

        return $query->where(function (Builder $builder) use ($term, $operator): void {
            $builder
                ->where('title', $operator, "%{$term}%")
                ->orWhere('description', $operator, "%{$term}%")
                ->orWhereHas('department', fn (Builder $departmentQuery) => $departmentQuery->where('name', $operator, "%{$term}%"));
        });
    }

    /**
     * Scope a query to filter by department.
     *
     * @param  Builder<Position>  $query
     * @return Builder<Position>
     */
    public function scopeForDepartment(Builder $query, ?int $departmentId): Builder
    {
        return filled($departmentId)
            ? $query->where('department_id', $departmentId)
            : $query;
    }

    /**
     * Scope a query to filter by activity state.
     *
     * @param  Builder<Position>  $query
     * @return Builder<Position>
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
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
