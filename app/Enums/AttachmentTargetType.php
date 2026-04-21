<?php

namespace App\Enums;

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
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Model;

enum AttachmentTargetType: string
{
    case Customer = 'customer';
    case Site = 'site';
    case Quotation = 'quotation';
    case Project = 'project';
    case WorkOrder = 'work_order';
    case Supplier = 'supplier';
    case PurchaseRequest = 'purchase_request';
    case PurchaseOrder = 'purchase_order';
    case PurchaseReceipt = 'purchase_receipt';
    case Invoice = 'invoice';
    case ComplianceRecord = 'compliance_record';

    /**
     * Resolve the model class handled by the attachment target.
     *
     * @return class-string<Model>
     */
    public function modelClass(): string
    {
        return match ($this) {
            self::Customer => Customer::class,
            self::Site => CustomerSite::class,
            self::Quotation => Quotation::class,
            self::Project => Project::class,
            self::WorkOrder => WorkOrder::class,
            self::Supplier => Supplier::class,
            self::PurchaseRequest => PurchaseRequest::class,
            self::PurchaseOrder => PurchaseOrder::class,
            self::PurchaseReceipt => PurchaseReceipt::class,
            self::Invoice => Invoice::class,
            self::ComplianceRecord => ComplianceRecord::class,
        };
    }

    /**
     * Resolve the attachable model for the given identifier.
     */
    public function resolveModel(int $id): Model
    {
        return $this->modelClass()::query()->findOrFail($id);
    }
}
