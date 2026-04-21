<?php

namespace App\Http\Requests\Purchasing;

use App\Models\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RecordPurchaseOrderApprovalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $purchaseOrder = $this->route('purchase_order');

        if (! $purchaseOrder instanceof PurchaseOrder || $this->user() === null) {
            return false;
        }

        $ability = $this->route()?->named('purchase-orders.approve')
            ? 'approve'
            : 'submit';

        return $this->user()->can($ability, $purchaseOrder);
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
