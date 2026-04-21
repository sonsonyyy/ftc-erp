<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\ComplianceRecord;
use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\PurchaseOrder;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseRequest;
use App\Models\Quotation;
use App\Models\Supplier;
use App\Models\User;
use App\Models\WorkOrder;

class AttachmentPolicy
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
        return $user->hasPermissionTo('attachments.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Attachment $attachment): bool
    {
        if (! $user->hasPermissionTo('attachments.view')) {
            return false;
        }

        $attachment->loadMissing(
            'customers',
            'customerSites',
            'quotations',
            'projects',
            'workOrders',
            'suppliers',
            'purchaseRequests',
            'purchaseOrders',
            'purchaseReceipts',
            'invoices',
            'complianceRecords',
        );

        return $attachment->customers->contains(
            fn (Customer $customer) => $user->can('view', $customer),
        ) || $attachment->customerSites->contains(
            fn (CustomerSite $site) => $user->can('view', $site),
        ) || $attachment->quotations->contains(
            fn (Quotation $quotation) => $user->can('view', $quotation),
        ) || $attachment->projects->contains(
            fn (Project $project) => $user->can('view', $project),
        ) || $attachment->workOrders->contains(
            fn (WorkOrder $workOrder) => $user->can('view', $workOrder),
        ) || $attachment->suppliers->contains(
            fn (Supplier $supplier) => $user->can('view', $supplier),
        ) || $attachment->purchaseRequests->contains(
            fn (PurchaseRequest $purchaseRequest) => $user->can('view', $purchaseRequest),
        ) || $attachment->purchaseOrders->contains(
            fn (PurchaseOrder $purchaseOrder) => $user->can('view', $purchaseOrder),
        ) || $attachment->purchaseReceipts->contains(
            fn (PurchaseReceipt $purchaseReceipt) => $user->can('view', $purchaseReceipt),
        ) || $attachment->invoices->contains(
            fn (Invoice $invoice) => $user->can('view', $invoice),
        ) || $attachment->complianceRecords->contains(
            fn (ComplianceRecord $complianceRecord) => $user->can('view', $complianceRecord),
        );
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('attachments.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Attachment $attachment): bool
    {
        return $user->hasPermissionTo('attachments.delete');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Attachment $attachment): bool
    {
        return $user->hasPermissionTo('attachments.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Attachment $attachment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Attachment $attachment): bool
    {
        return false;
    }
}
