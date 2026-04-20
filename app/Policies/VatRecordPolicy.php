<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VatRecord;

class VatRecordPolicy
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
        return $user->hasPermissionTo('vat_records.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, VatRecord $vatRecord): bool
    {
        return $user->hasPermissionTo('vat_records.view');
    }
}
