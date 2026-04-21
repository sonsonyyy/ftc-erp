<?php

namespace App\Models;

use App\Enums\ComplianceTaskStatus;
use Database\Factories\ComplianceTaskFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'compliance_record_id',
    'title',
    'due_date',
    'assigned_user_id',
    'status',
    'completed_at',
    'notes',
])]
class ComplianceTask extends Model
{
    /** @use HasFactory<ComplianceTaskFactory> */
    use HasFactory;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => ComplianceTaskStatus::Open->value,
    ];

    /**
     * Get the parent compliance record.
     *
     * @return BelongsTo<ComplianceRecord, $this>
     */
    public function complianceRecord(): BelongsTo
    {
        return $this->belongsTo(ComplianceRecord::class);
    }

    /**
     * Get the assigned user for the task.
     *
     * @return BelongsTo<User, $this>
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id')->withTrashed();
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => ComplianceTaskStatus::class,
            'completed_at' => 'datetime',
        ];
    }
}
