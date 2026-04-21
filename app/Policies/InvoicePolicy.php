<?php

namespace App\Policies;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
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
        return $user->hasPermissionTo('invoices.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('invoices.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('invoices.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('invoices.update')
            && ! $invoice->paymentAllocations()->exists();
    }

    /**
     * Determine whether the user can submit the invoice for approval.
     */
    public function submit(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('invoices.update')
            && ! $invoice->paymentAllocations()->exists()
            && $invoice->status === InvoiceStatus::Draft
            && $invoice->submitted_at === null
            && $invoice->approved_at === null;
    }

    /**
     * Determine whether the user can approve and issue the invoice.
     */
    public function approve(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('invoices.approve')
            && ! $invoice->paymentAllocations()->exists()
            && $invoice->status === InvoiceStatus::Draft
            && $invoice->submitted_at !== null
            && $invoice->approved_at === null;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('invoices.delete')
            && ! $invoice->paymentAllocations()->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Invoice $invoice): bool
    {
        return $user->hasPermissionTo('invoices.update');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Invoice $invoice): bool
    {
        return false;
    }
}
