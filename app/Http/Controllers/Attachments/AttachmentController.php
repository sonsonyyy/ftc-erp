<?php

namespace App\Http\Controllers\Attachments;

use App\Actions\Attachments\AttachmentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attachments\StoreAttachmentRequest;
use App\Http\Requests\Attachments\UnlinkAttachmentRequest;
use App\Models\Attachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    /**
     * Store a new attachment and link it to the selected record.
     */
    public function store(StoreAttachmentRequest $request, AttachmentService $attachmentService): RedirectResponse
    {
        $attachable = $request->attachmentTarget()->resolveModel($request->attachableId());

        abort_unless($request->user()?->hasPermissionTo('attachments.create'), 403);

        $this->authorize('update', $attachable);

        $attachmentService->storeFor($attachable, $request->file('file'), $request->user());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Attachment uploaded.'),
        ]);

        return back();
    }

    /**
     * Download the selected attachment.
     */
    public function download(Attachment $attachment): StreamedResponse
    {
        $this->authorize('view', $attachment);

        return Storage::disk($attachment->disk)->download(
            $attachment->path,
            $attachment->original_name,
        );
    }

    /**
     * Unlink the attachment from a specific record.
     */
    public function unlink(
        UnlinkAttachmentRequest $request,
        Attachment $attachment,
        AttachmentService $attachmentService,
    ): RedirectResponse {
        $attachable = $request->attachmentTarget()->resolveModel($request->attachableId());

        abort_unless($request->user()?->hasPermissionTo('attachments.delete'), 403);

        $this->authorize('update', $attachable);

        abort_unless(
            $attachable->attachments()->whereKey($attachment->getKey())->exists(),
            404,
        );

        $attachmentService->unlinkFrom($attachable, $attachment);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Attachment removed.'),
        ]);

        return back();
    }
}
