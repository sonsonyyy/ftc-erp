<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'email_verified_at', 'is_active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * The roles assigned to the user.
     *
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Scope a query to search user records.
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        $term = trim((string) $search);

        if ($term === '') {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($term): void {
            $builder
                ->where('name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%");
        });
    }

    /**
     * Scope a query to filter by activity flag.
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public function scopeActive(Builder $query, ?string $isActive): Builder
    {
        return match ($isActive) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => $query,
        };
    }

    /**
     * Scope a query to filter by assigned role.
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public function scopeForRole(Builder $query, ?int $roleId): Builder
    {
        return filled($roleId)
            ? $query->whereHas('roles', fn (Builder $roleQuery) => $roleQuery->where('roles.id', $roleId))
            : $query;
    }

    /**
     * Determine if the user has the given role.
     */
    public function hasRole(string $roleName): bool
    {
        if ($this->relationLoaded('roles')) {
            /** @var Collection<int, Role> $roles */
            $roles = $this->roles;

            return $roles->contains('name', $roleName);
        }

        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Determine if the user can access the given permission.
     */
    public function hasPermissionTo(string $permissionName): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->relationLoaded('roles')) {
            /** @var Collection<int, Role> $roles */
            $roles = $this->roles;

            return $roles
                ->loadMissing('permissions')
                ->flatMap(fn (Role $role) => $role->permissions)
                ->contains('name', $permissionName);
        }

        return $this->roles()->whereHas(
            'permissions',
            fn ($query) => $query->where('permissions.name', $permissionName),
        )->exists();
    }

    /**
     * Determine if the user is a super administrator.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Role::SUPER_ADMIN);
    }

    /**
     * Get the assigned role names.
     *
     * @return array<int, string>
     */
    public function roleNames(): array
    {
        if ($this->relationLoaded('roles')) {
            /** @var Collection<int, Role> $roles */
            $roles = $this->roles;

            return $roles->pluck('name')->sort()->values()->all();
        }

        return $this->roles()->pluck('name')->sort()->values()->all();
    }

    /**
     * Get the permission names available to the user through roles.
     *
     * @return array<int, string>
     */
    public function permissionNames(): array
    {
        if ($this->relationLoaded('roles')) {
            /** @var Collection<int, Role> $roles */
            $roles = $this->roles;

            return $roles
                ->loadMissing('permissions')
                ->flatMap(fn (Role $role) => $role->permissions)
                ->pluck('name')
                ->unique()
                ->sort()
                ->values()
                ->all();
        }

        return Permission::query()
            ->select('permissions.name')
            ->join('permission_role', 'permission_role.permission_id', '=', 'permissions.id')
            ->join('role_user', 'role_user.role_id', '=', 'permission_role.role_id')
            ->where('role_user.user_id', $this->getKey())
            ->distinct()
            ->orderBy('permissions.name')
            ->pluck('permissions.name')
            ->all();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
