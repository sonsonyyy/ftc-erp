<?php

namespace App\Concerns;

use App\Models\Attachment;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasAttachments
{
    /**
     * Get the attachments linked to the model.
     *
     * @return MorphToMany<Attachment, $this>
     */
    public function attachments(): MorphToMany
    {
        return $this->morphToMany(Attachment::class, 'attachable', 'attachment_links')
            ->withTimestamps()
            ->orderByDesc('attachments.created_at');
    }
}
