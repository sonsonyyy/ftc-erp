<?php

namespace App\Policies;

use App\Models\ComplianceRecord;
use App\Models\User;

class ComplianceRecordPolicy
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
        return $user->hasPermissionTo('compliance_records.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ComplianceRecord $complianceRecord): bool
    {
        return $user->hasPermissionTo('compliance_records.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('compliance_records.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ComplianceRecord $complianceRecord): bool
    {
        return $user->hasPermissionTo('compliance_records.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ComplianceRecord $complianceRecord): bool
    {
        return $user->hasPermissionTo('compliance_records.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ComplianceRecord $complianceRecord): bool
    {
        return $user->hasPermissionTo('compliance_records.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ComplianceRecord $complianceRecord): bool
    {
        return false;
    }
}
