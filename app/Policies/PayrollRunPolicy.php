<?php

namespace App\Policies;

use App\Models\PayrollRun;
use App\Models\User;

class PayrollRunPolicy
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
        return $user->hasPermissionTo('payroll_runs.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PayrollRun $payrollRun): bool
    {
        return $user->hasPermissionTo('payroll_runs.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('payroll_runs.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PayrollRun $payrollRun): bool
    {
        return $user->hasPermissionTo('payroll_runs.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PayrollRun $payrollRun): bool
    {
        return $user->hasPermissionTo('payroll_runs.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, PayrollRun $payrollRun): bool
    {
        return $user->hasPermissionTo('payroll_runs.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, PayrollRun $payrollRun): bool
    {
        return false;
    }
}
