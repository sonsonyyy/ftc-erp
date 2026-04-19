<?php

namespace App\Http\Requests\Users;

use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User $managedUser */
        $managedUser = $this->route('user');

        return [
            ...$this->profileRules($managedUser->getKey()),
            'password' => array_values(array_filter([
                'nullable',
                'string',
                Password::default(),
                'confirmed',
            ])),
            'is_active' => ['required', 'boolean'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['integer', Rule::exists((new Role)->getTable(), 'id')],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var User|null $managedUser */
                $managedUser = $this->route('user');

                if (! $managedUser instanceof User) {
                    return;
                }

                $selectedRoleIds = collect($this->input('role_ids', []))
                    ->map(fn (mixed $roleId): int => (int) $roleId);

                $superAdminRoleId = Role::query()
                    ->where('name', Role::SUPER_ADMIN)
                    ->value('id');

                $willRemainSuperAdmin = $superAdminRoleId !== null
                    && $selectedRoleIds->contains((int) $superAdminRoleId);

                $isSelfUpdate = $this->user()?->is($managedUser) ?? false;

                if ($isSelfUpdate && ! $this->boolean('is_active')) {
                    $validator->errors()->add(
                        'is_active',
                        'You cannot deactivate your own account.',
                    );
                }

                if (
                    $isSelfUpdate
                    && $managedUser->hasRole(Role::SUPER_ADMIN)
                    && ! $willRemainSuperAdmin
                ) {
                    $validator->errors()->add(
                        'role_ids',
                        'You cannot remove the Super Admin role from your own account.',
                    );
                }

                if (
                    $managedUser->hasRole(Role::SUPER_ADMIN)
                    && (! $this->boolean('is_active') || ! $willRemainSuperAdmin)
                ) {
                    $remainingActiveSuperAdmins = User::query()
                        ->where('id', '!=', $managedUser->getKey())
                        ->where('is_active', true)
                        ->whereHas('roles', fn ($query) => $query->where('roles.name', Role::SUPER_ADMIN))
                        ->count();

                    if ($remainingActiveSuperAdmins === 0) {
                        $validator->errors()->add(
                            'role_ids',
                            'At least one active Super Admin account must remain.',
                        );
                    }
                }
            },
        ];
    }
}
