<?php

namespace App\Models;

use Database\Factories\WorkOrderMaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'work_order_id',
    'item_code',
    'item_name',
    'quantity',
    'unit',
    'notes',
])]
class WorkOrderMaterial extends Model
{
    /** @use HasFactory<WorkOrderMaterialFactory> */
    use HasFactory;

    /**
     * Get the work order that owns the material line.
     *
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
        ];
    }
}
