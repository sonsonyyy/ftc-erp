<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('roles:id,name')
            ->search($request->string('search')->toString())
            ->forRole($request->integer('role') ?: null)
            ->active($request->string('active')->toString())
            ->orderBy('name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (User $managedUser) => $this->userListItem($request, $managedUser));

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'role' => $request->integer('role') ?: null,
                'active' => $request->string('active')->toString(),
            ],
            'roleOptions' => $this->roleOptions(),
            'activityOptions' => $this->activityOptions(),
            'can' => [
                'create' => $request->user()?->can('create', User::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('users/create', [
            'roleOptions' => $this->roleOptions(),
            'defaults' => [
                'is_active' => true,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();

        $managedUser = DB::transaction(function () use ($validated): User {
            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'email_verified_at' => now(),
                'is_active' => $validated['is_active'],
            ]);

            $user->roles()->sync($validated['role_ids']);

            return $user;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User account created.'),
        ]);

        return to_route('users.show', $managedUser);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, User $user): Response
    {
        $this->authorize('view', $user);

        $user->loadMissing('roles.permissions');

        return Inertia::render('users/show', [
            'managedUser' => $this->userDetail($request, $user),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, User $user): Response
    {
        $this->authorize('update', $user);

        $user->loadMissing('roles.permissions');

        return Inertia::render('users/edit', [
            'managedUser' => $this->userDetail($request, $user),
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated): void {
            $attributes = Arr::except($validated, [
                'password',
                'password_confirmation',
                'role_ids',
            ]);

            if (($validated['email'] ?? $user->email) !== $user->email) {
                $attributes['email_verified_at'] = now();
            }

            if (filled($validated['password'] ?? null)) {
                $attributes['password'] = $validated['password'];
            }

            $user->update($attributes);
            $user->roles()->sync($validated['role_ids']);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User account updated.'),
        ]);

        return to_route('users.show', $user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User account archived.'),
        ]);

        return to_route('users.index');
    }

    /**
     * Transform a user into an index-friendly payload.
     *
     * @return array<string, mixed>
     */
    private function userListItem(Request $request, User $managedUser): array
    {
        return [
            'id' => $managedUser->getKey(),
            'name' => $managedUser->name,
            'email' => $managedUser->email,
            'is_active' => $managedUser->is_active,
            'email_verified_at' => optional($managedUser->email_verified_at)?->toIso8601String(),
            'roles' => $managedUser->roleNames(),
            'created_at' => optional($managedUser->created_at)?->toIso8601String(),
            'can' => [
                'view' => $request->user()?->can('view', $managedUser) ?? false,
                'update' => $request->user()?->can('update', $managedUser) ?? false,
                'delete' => $request->user()?->can('delete', $managedUser) ?? false,
            ],
        ];
    }

    /**
     * Transform a user into a detailed payload.
     *
     * @return array<string, mixed>
     */
    private function userDetail(Request $request, User $managedUser): array
    {
        return [
            'id' => $managedUser->getKey(),
            'name' => $managedUser->name,
            'email' => $managedUser->email,
            'is_active' => $managedUser->is_active,
            'email_verified_at' => optional($managedUser->email_verified_at)?->toIso8601String(),
            'created_at' => optional($managedUser->created_at)?->toIso8601String(),
            'updated_at' => optional($managedUser->updated_at)?->toIso8601String(),
            'roles' => $managedUser->roles
                ->map(fn (Role $role) => [
                    'id' => $role->getKey(),
                    'name' => $role->name,
                    'description' => $role->description,
                ])->values()->all(),
            'permissions' => $managedUser->permissionNames(),
            'can' => [
                'update' => $request->user()?->can('update', $managedUser) ?? false,
                'delete' => $request->user()?->can('delete', $managedUser) ?? false,
            ],
        ];
    }

    /**
     * Build the available role options.
     *
     * @return array<int, array<string, int|string>>
     */
    private function roleOptions(): array
    {
        return Role::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role) => [
                'value' => $role->getKey(),
                'label' => $role->name,
            ])->all();
    }

    /**
     * Build the activity filter options.
     *
     * @return array<int, array<string, string>>
     */
    private function activityOptions(): array
    {
        return [
            ['value' => 'active', 'label' => 'Active only'],
            ['value' => 'inactive', 'label' => 'Inactive only'],
        ];
    }
}
