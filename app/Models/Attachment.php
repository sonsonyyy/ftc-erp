<?php

namespace App\Models;

use Database\Factories\AttachmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

#[Fillable([
    'disk',
    'path',
    'original_name',
    'mime_type',
    'extension',
    'file_size',
    'uploaded_by',
])]
class Attachment extends Model
{
    /** @use HasFactory<AttachmentFactory> */
    use HasFactory;

    /**
     * The user who uploaded the attachment.
     *
     * @return BelongsTo<User, $this>
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * All attachment links for this file.
     *
     * @return HasMany<AttachmentLink, $this>
     */
    public function links(): HasMany
    {
        return $this->hasMany(AttachmentLink::class);
    }

    /**
     * Customers linked to this attachment.
     *
     * @return MorphToMany<Customer, $this>
     */
    public function customers(): MorphToMany
    {
        return $this->morphedByMany(Customer::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Customer sites linked to this attachment.
     *
     * @return MorphToMany<CustomerSite, $this>
     */
    public function customerSites(): MorphToMany
    {
        return $this->morphedByMany(CustomerSite::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Quotations linked to this attachment.
     *
     * @return MorphToMany<Quotation, $this>
     */
    public function quotations(): MorphToMany
    {
        return $this->morphedByMany(Quotation::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Projects linked to this attachment.
     *
     * @return MorphToMany<Project, $this>
     */
    public function projects(): MorphToMany
    {
        return $this->morphedByMany(Project::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Work orders linked to this attachment.
     *
     * @return MorphToMany<WorkOrder, $this>
     */
    public function workOrders(): MorphToMany
    {
        return $this->morphedByMany(WorkOrder::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Suppliers linked to this attachment.
     *
     * @return MorphToMany<Supplier, $this>
     */
    public function suppliers(): MorphToMany
    {
        return $this->morphedByMany(Supplier::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Purchase requests linked to this attachment.
     *
     * @return MorphToMany<PurchaseRequest, $this>
     */
    public function purchaseRequests(): MorphToMany
    {
        return $this->morphedByMany(PurchaseRequest::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Purchase orders linked to this attachment.
     *
     * @return MorphToMany<PurchaseOrder, $this>
     */
    public function purchaseOrders(): MorphToMany
    {
        return $this->morphedByMany(PurchaseOrder::class, 'attachable', 'attachment_links')->withTimestamps();
    }

    /**
     * Purchase receipts linked to this attachment.
     *
     * @return MorphToMany<PurchaseReceipt, $this>
     */
    public function purchaseReceipts(): MorphToMany
    {
        return $this->morphedByMany(PurchaseReceipt::class, 'attachable', 'attachment_links')->withTimestamps();
    }
}
