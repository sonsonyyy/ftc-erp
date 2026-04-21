<?php

namespace App\Http\Requests\Billing;

use App\Models\Invoice;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RecordInvoiceApprovalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $invoice = $this->route('invoice');

        if (! $invoice instanceof Invoice || $this->user() === null) {
            return false;
        }

        $ability = $this->route()?->named('invoices.approve')
            ? 'approve'
            : 'submit';

        return $this->user()->can($ability, $invoice);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'approval_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
