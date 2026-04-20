<?php

namespace App\Actions\Billing;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;

class RecalculateInvoiceTotalsAction
{
    /**
     * Refresh invoice totals, balance, and stored status.
     */
    public function handle(Invoice $invoice): Invoice
    {
        $subtotal = round((float) $invoice->items()->sum('line_total'), 2);
        $taxAmount = round((float) $invoice->tax_amount, 2);
        $totalAmount = round($subtotal + $taxAmount, 2);
        $paidAmount = round((float) $invoice->paymentAllocations()->sum('allocated_amount'), 2);
        $balanceAmount = max(round($totalAmount - $paidAmount, 2), 0);

        $invoice->update([
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
            'balance_amount' => $balanceAmount,
            'status' => $this->persistedStatus($invoice, $paidAmount, $balanceAmount, $totalAmount),
        ]);

        return $invoice->refresh();
    }

    /**
     * Determine the persisted status after totals are recalculated.
     */
    private function persistedStatus(
        Invoice $invoice,
        float $paidAmount,
        float $balanceAmount,
        float $totalAmount,
    ): InvoiceStatus {
        $status = $invoice->status instanceof InvoiceStatus
            ? $invoice->status
            : InvoiceStatus::from($invoice->status);

        if ($status === InvoiceStatus::Cancelled) {
            return InvoiceStatus::Cancelled;
        }

        if ($status === InvoiceStatus::Draft && $paidAmount <= 0) {
            return InvoiceStatus::Draft;
        }

        if ($totalAmount > 0 && $balanceAmount <= 0) {
            return InvoiceStatus::Paid;
        }

        if ($paidAmount > 0) {
            return InvoiceStatus::PartiallyPaid;
        }

        return InvoiceStatus::Issued;
    }
}
