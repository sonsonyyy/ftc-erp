<?php

namespace App\Enums;

use App\Models\Customer;
use App\Models\CustomerSite;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Model;

enum AttachmentTargetType: string
{
    case Customer = 'customer';
    case Site = 'site';
    case Quotation = 'quotation';
    case Project = 'project';
    case WorkOrder = 'work_order';

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
