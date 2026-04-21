<?php

namespace App\Policies;

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use App\Models\User;

class PurchaseOrderPolicy
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
        return $user->hasPermissionTo('purchase_orders.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermissionTo('purchase_orders.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('purchase_orders.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermissionTo('purchase_orders.update');
    }

    /**
     * Determine whether the user can submit the purchase order for approval.
     */
    public function submit(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermissionTo('purchase_orders.update')
            && ! $purchaseOrder->receipts()->exists()
            && $purchaseOrder->status === PurchaseOrderStatus::Draft;
    }

    /**
     * Determine whether the user can approve the purchase order.
     */
    public function approve(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermissionTo('purchase_orders.approve')
            && ! $purchaseOrder->receipts()->exists()
            && $purchaseOrder->status === PurchaseOrderStatus::Submitted;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        $receiptCount = $purchaseOrder->getAttribute('receipts_count');

        if ($receiptCount === null) {
            $receiptCount = $purchaseOrder->receipts()->count();
        }

        return $user->hasPermissionTo('purchase_orders.delete') && (int) $receiptCount === 0;
    }

    /**
     * Determine whether the user can receive against the purchase order.
     */
    public function receive(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermissionTo('purchase_orders.receive')
            && $purchaseOrder->status->allowsReceiving()
            && $purchaseOrder->hasReceivableItems();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return $user->hasPermissionTo('purchase_orders.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return false;
    }
}
