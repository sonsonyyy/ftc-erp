<?php

namespace App\Policies;

use App\Models\CustomerSite;
use App\Models\User;

class CustomerSitePolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('sites.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CustomerSite $customerSite): bool
    {
        return $user->hasPermissionTo('sites.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('sites.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CustomerSite $customerSite): bool
    {
        return $user->hasPermissionTo('sites.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CustomerSite $customerSite): bool
    {
        return $user->hasPermissionTo('sites.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CustomerSite $customerSite): bool
    {
        return $user->hasPermissionTo('sites.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CustomerSite $customerSite): bool
    {
        return false;
    }
}
