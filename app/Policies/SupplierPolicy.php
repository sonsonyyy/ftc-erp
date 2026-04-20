<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
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
        return $user->hasPermissionTo('suppliers.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionTo('suppliers.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('suppliers.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionTo('suppliers.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Supplier $supplier): bool
    {
        $purchaseRequestCount = $supplier->getAttribute('purchase_requests_count');
        $purchaseOrderCount = $supplier->getAttribute('purchase_orders_count');

        if ($purchaseRequestCount === null) {
            $purchaseRequestCount = $supplier->purchaseRequests()->count();
        }

        if ($purchaseOrderCount === null) {
            $purchaseOrderCount = $supplier->purchaseOrders()->count();
        }

        return $user->hasPermissionTo('suppliers.delete')
            && (int) $purchaseRequestCount === 0
            && (int) $purchaseOrderCount === 0;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionTo('suppliers.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Supplier $supplier): bool
    {
        return false;
    }
}
