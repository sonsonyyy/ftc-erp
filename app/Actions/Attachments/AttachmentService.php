<?php

namespace App\Actions\Attachments;

use App\Models\Attachment;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentService
{
    /**
     * Store an uploaded file and link it to the given record.
     */
    public function storeFor(Model $attachable, UploadedFile $file, User $uploadedBy): Attachment
    {
        $disk = (string) config('filesystems.default', 'local');
        $directory = sprintf(
            'attachments/%s/%s',
            Str::kebab(class_basename($attachable)),
            now()->format('Y/m'),
        );
        $path = $file->store($directory, $disk);

        $attachment = Attachment::create([
            'disk' => $disk,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'extension' => $file->extension(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $uploadedBy->getKey(),
        ]);

        $attachable->attachments()->syncWithoutDetaching([$attachment->getKey()]);

        return $attachment->fresh(['uploadedBy']);
    }

    /**
     * Unlink the attachment from the given record and remove the file
     * completely once no records reference it anymore.
     */
    public function unlinkFrom(Model $attachable, Attachment $attachment): void
    {
        $attachable->attachments()->detach($attachment->getKey());

        if ($attachment->fresh()->links()->exists()) {
            return;
        }

        Storage::disk($attachment->disk)->delete($attachment->path);

        $attachment->delete();
    }
}
