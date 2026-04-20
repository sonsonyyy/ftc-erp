<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WithholdingRecord;

class WithholdingRecordPolicy
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
        return $user->hasPermissionTo('withholding_records.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WithholdingRecord $withholdingRecord): bool
    {
        return $user->hasPermissionTo('withholding_records.view');
    }
}
