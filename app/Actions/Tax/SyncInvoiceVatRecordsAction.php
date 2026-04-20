<?php

namespace App\Actions\Tax;

use App\Enums\InvoiceStatus;
use App\Enums\VatRecordType;
use App\Models\Invoice;
use App\Models\VatRecord;

class SyncInvoiceVatRecordsAction
{
    /**
     * Sync VAT records for one invoice.
     */
    public function handle(Invoice $invoice): void
    {
        $this->deleteForInvoice($invoice);

        if (in_array($invoice->status, [
            InvoiceStatus::Draft,
            InvoiceStatus::Cancelled,
        ], true)) {
            return;
        }

        if (round((float) $invoice->tax_amount, 2) <= 0) {
            return;
        }

        $recordDate = optional($invoice->invoice_date)?->toDateString();

        if ($recordDate === null) {
            return;
        }

        VatRecord::query()->create([
            'record_type' => VatRecordType::OutputVat->value,
            'source_type' => 'invoice',
            'source_id' => $invoice->getKey(),
            'record_date' => $recordDate,
            'reference_no' => $invoice->invoice_no,
            'counterparty_name' => $invoice->customer?->company_name ?? 'Unknown customer',
            'counterparty_tin' => $invoice->customer?->tin,
            'net_amount' => $invoice->subtotal,
            'vat_amount' => $invoice->tax_amount,
            'gross_amount' => $invoice->total_amount,
            'metadata' => [
                'invoice_id' => $invoice->getKey(),
                'invoice_no' => $invoice->invoice_no,
                'customer_id' => $invoice->customer?->getKey(),
                'customer_code' => $invoice->customer?->customer_code,
                'customer_name' => $invoice->customer?->company_name,
                'quotation_id' => $invoice->quotation?->getKey(),
                'project_id' => $invoice->project?->getKey(),
                'work_order_id' => $invoice->workOrder?->getKey(),
            ],
        ]);
    }

    /**
     * Sync VAT records for invoices in a date range.
     */
    public function syncPeriod(string $from, string $to): void
    {
        Invoice::query()
            ->betweenInvoiceDates($from, $to)
            ->with([
                'customer:id,customer_code,company_name,tin',
                'quotation:id',
                'project:id',
                'workOrder:id',
            ])
            ->get()
            ->each(fn (Invoice $invoice) => $this->handle($invoice));
    }

    /**
     * Delete VAT records tied to the given invoice.
     */
    public function deleteForInvoice(Invoice $invoice): void
    {
        VatRecord::query()
            ->where('source_type', 'invoice')
            ->where('source_id', $invoice->getKey())
            ->delete();
    }
}
