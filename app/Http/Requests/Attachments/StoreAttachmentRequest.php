<?php

namespace App\Http\Requests\Attachments;

use App\Enums\AttachmentTargetType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreAttachmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'attachable_type' => ['required', Rule::enum(AttachmentTargetType::class)],
            'attachable_id' => ['required', 'integer', 'min:1'],
            'file' => [
                'required',
                File::types([
                    'pdf',
                    'xls',
                    'xlsx',
                    'csv',
                    'doc',
                    'docx',
                    'jpg',
                    'jpeg',
                    'png',
                    'webp',
                    'txt',
                    'zip',
                ])->max('20mb'),
            ],
        ];
    }

    /**
     * Get the target type for the attachment request.
     */
    public function attachmentTarget(): AttachmentTargetType
    {
        return AttachmentTargetType::from((string) $this->input('attachable_type'));
    }

    /**
     * Get the target record identifier for the attachment request.
     */
    public function attachableId(): int
    {
        return (int) $this->input('attachable_id');
    }
}
