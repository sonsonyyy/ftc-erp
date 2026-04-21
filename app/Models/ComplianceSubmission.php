<?php

namespace App\Models;

use Database\Factories\ComplianceSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'compliance_record_id',
    'reference_no',
    'submitted_at',
    'submitted_by_user_id',
    'due_date_snapshot',
    'expiry_date_snapshot',
    'next_due_date',
    'next_expiry_date',
    'remarks',
    'approved_at',
    'approved_by_user_id',
    'approval_notes',
])]
class ComplianceSubmission extends Model
{
    /** @use HasFactory<ComplianceSubmissionFactory> */
    use HasFactory;

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
     * Get the user who encoded the submission.
     *
     * @return BelongsTo<User, $this>
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id')->withTrashed();
    }

    /**
     * Get the user who approved the submission.
     *
     * @return BelongsTo<User, $this>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id')->withTrashed();
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'date',
            'due_date_snapshot' => 'date',
            'expiry_date_snapshot' => 'date',
            'next_due_date' => 'date',
            'next_expiry_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }
}
