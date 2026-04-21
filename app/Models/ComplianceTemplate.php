<?php

namespace App\Models;

use App\Enums\ComplianceRecurrenceUnit;
use Database\Factories\ComplianceTemplateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'agency',
    'category',
    'description',
    'default_recurrence_unit',
    'default_reminder_days',
    'is_active',
])]
class ComplianceTemplate extends Model
{
    /** @use HasFactory<ComplianceTemplateFactory> */
    use HasFactory, SoftDeletes;

    /**
     * The model's default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'default_recurrence_unit' => ComplianceRecurrenceUnit::None->value,
        'is_active' => true,
    ];

    /**
     * Get the compliance records linked to this template.
     *
     * @return HasMany<ComplianceRecord, $this>
     */
    public function complianceRecords(): HasMany
    {
        return $this->hasMany(ComplianceRecord::class)->orderBy('title');
    }

    /**
     * Scope a query to active templates.
     *
     * @param  Builder<ComplianceTemplate>  $query
     * @return Builder<ComplianceTemplate>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the attribute casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'default_recurrence_unit' => ComplianceRecurrenceUnit::class,
            'default_reminder_days' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
