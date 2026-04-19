import { router, useForm } from '@inertiajs/react';
import AttachmentController from '@/actions/App/Http/Controllers/Attachments/AttachmentController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AttachmentItem } from '@/types';

type Props = {
    attachments: AttachmentItem[];
    attachableType: 'customer' | 'site' | 'quotation' | 'project' | 'work_order';
    attachableId: number;
    canUpload: boolean;
    canUnlink: boolean;
    title?: string;
    description?: string;
};

function formatFileSize(fileSize: number): string {
    if (fileSize >= 1_048_576) {
        return `${(fileSize / 1_048_576).toFixed(1)} MB`;
    }

    if (fileSize >= 1_024) {
        return `${(fileSize / 1_024).toFixed(1)} KB`;
    }

    return `${fileSize} B`;
}

export function RecordAttachmentsCard({
    attachments,
    attachableType,
    attachableId,
    canUpload,
    canUnlink,
    title = 'Attachments',
    description = 'Shared files linked to this record.',
}: Props) {
    const form = useForm({
        attachable_type: attachableType,
        attachable_id: attachableId,
        file: null as File | null,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.submit(AttachmentController.store(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('file');
            },
        });
    }

    function unlinkAttachment(attachmentId: number) {
        router.post(
            AttachmentController.unlink(attachmentId),
            {
                attachable_type: attachableType,
                attachable_id: attachableId,
            },
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {canUpload && (
                    <form onSubmit={submit} className="space-y-3">
                        <div className="grid gap-2">
                            <Label htmlFor={`${attachableType}-attachment`}>
                                Upload file
                            </Label>

                            <Input
                                id={`${attachableType}-attachment`}
                                type="file"
                                onChange={(event) =>
                                    form.setData(
                                        'file',
                                        event.currentTarget.files?.[0] ?? null,
                                    )
                                }
                            />

                            <InputError message={form.errors.file} />
                        </div>

                        <Button disabled={form.processing || form.data.file === null}>
                            {form.processing ? 'Uploading...' : 'Upload attachment'}
                        </Button>
                    </form>
                )}

                <div className="space-y-3">
                    {attachments.length === 0 && (
                        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                            No attachments linked yet.
                        </div>
                    )}

                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex flex-col gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-center md:justify-between"
                        >
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {attachment.original_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {formatFileSize(attachment.file_size)}
                                    {attachment.uploaded_by &&
                                        ` • uploaded by ${attachment.uploaded_by}`}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={attachment.download_url}>Download</a>
                                </Button>

                                {canUnlink && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            unlinkAttachment(attachment.id)
                                        }
                                    >
                                        Unlink
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
