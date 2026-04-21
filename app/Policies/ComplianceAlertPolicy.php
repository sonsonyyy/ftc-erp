<?php

namespace App\Policies;

use App\Models\ComplianceAlert;
use App\Models\User;

class ComplianceAlertPolicy
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
        return $user->hasPermissionTo('compliance_alerts.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ComplianceAlert $complianceAlert): bool
    {
        return $user->hasPermissionTo('compliance_alerts.view');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ComplianceAlert $complianceAlert): bool
    {
        return $user->hasPermissionTo('compliance_alerts.acknowledge');
    }
}
