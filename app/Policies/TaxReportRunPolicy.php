<?php

namespace App\Policies;

use App\Models\TaxReportRun;
use App\Models\User;

class TaxReportRunPolicy
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
        return $user->hasPermissionTo('tax_report_runs.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TaxReportRun $taxReportRun): bool
    {
        return $user->hasPermissionTo('tax_report_runs.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tax_report_runs.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TaxReportRun $taxReportRun): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaxReportRun $taxReportRun): bool
    {
        return $user->hasPermissionTo('tax_report_runs.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TaxReportRun $taxReportRun): bool
    {
        return $user->hasPermissionTo('tax_report_runs.delete');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TaxReportRun $taxReportRun): bool
    {
        return false;
    }
}
