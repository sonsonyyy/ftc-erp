<?php

namespace App\Models;

use App\Enums\WorkOrderLogType;
use App\Enums\WorkOrderStatus;
use Database\Factories\WorkOrderLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'work_order_id',
    'log_type',
    'from_status',
    'to_status',
    'details',
    'logged_by',
    'logged_at',
])]
class WorkOrderLog extends Model
{
    /** @use HasFactory<WorkOrderLogFactory> */
    use HasFactory;

    /**
     * Disable default timestamps because the log uses logged_at.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the work order that owns the log.
     *
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Get the user who recorded the log.
     *
     * @return BelongsTo<User, $this>
     */
    public function loggedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'logged_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'log_type' => WorkOrderLogType::class,
            'from_status' => WorkOrderStatus::class,
            'to_status' => WorkOrderStatus::class,
            'logged_at' => 'datetime',
        ];
    }
}
