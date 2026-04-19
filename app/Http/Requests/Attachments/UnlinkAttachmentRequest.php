<?php

namespace App\Http\Requests\Attachments;

use App\Enums\AttachmentTargetType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UnlinkAttachmentRequest extends FormRequest
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
        ];
    }

    /**
     * Get the target type for the attachment unlink request.
     */
    public function attachmentTarget(): AttachmentTargetType
    {
        return AttachmentTargetType::from((string) $this->input('attachable_type'));
    }

    /**
     * Get the target record identifier for the attachment unlink request.
     */
    public function attachableId(): int
    {
        return (int) $this->input('attachable_id');
    }
}
