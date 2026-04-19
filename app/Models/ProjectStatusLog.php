<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Database\Factories\ProjectStatusLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_id',
    'from_status',
    'to_status',
    'changed_by',
    'remarks',
    'changed_at',
])]
class ProjectStatusLog extends Model
{
    /** @use HasFactory<ProjectStatusLogFactory> */
    use HasFactory;

    /**
     * Disable default timestamps because the log uses changed_at.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the project that owns the status log.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who changed the project status.
     *
     * @return BelongsTo<User, $this>
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'from_status' => ProjectStatus::class,
            'to_status' => ProjectStatus::class,
            'changed_at' => 'datetime',
        ];
    }
}
