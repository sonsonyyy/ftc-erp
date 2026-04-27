<?php

namespace App\Http\Controllers\Billing;

use App\Enums\InvoiceStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AccountsReceivableController extends Controller
{
    private const PER_PAGE = 15;

    private const PER_PAGE_OPTIONS = [5, 10, 15, 25];

    /**
     * Display the accounts-receivable aging view.
     */
    public function __invoke(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $search = $request->string('search')->toString();
        $customerId = $request->integer('customer') ?: null;
        $status = $request->string('status')->toString();
        $from = $this->normalizeDateFilter($request->string('from')->toString());
        $to = $this->normalizeDateFilter($request->string('to')->toString());
        $perPage = $this->resolvePerPage($request);

        $baseQuery = Invoice::query()
            ->with([
                'customer:id,customer_code,company_name',
                'project:id,project_no,title',
                'workOrder:id,work_order_no,summary',
            ])
            ->search($search)
            ->forCustomer($customerId)
            ->betweenInvoiceDates($from, $to)
            ->whereNotIn('status', [
                InvoiceStatus::Draft->value,
                InvoiceStatus::Cancelled->value,
            ]);

        if (filled($status)) {
            $baseQuery->status($status);
        }

        $reportData = (clone $baseQuery)
            ->orderByDesc('invoice_date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Invoice $invoice) => $this->reportRow($invoice));

        $summary = $this->summary((clone $baseQuery)->get());

        return Inertia::render('accounts-receivable/index', [
            'report' => $reportData,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'customer' => $customerId,
                'status' => $status,
                'from' => $from,
                'to' => $to,
                'per_page' => $perPage,
            ],
            'customerOptions' => $this->customerOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Build a report row for an invoice.
     *
     * @return array<string, mixed>
     */
    private function reportRow(Invoice $invoice): array
    {
        $status = $invoice->currentStatus();
        $ageDays = $this->ageDays($invoice);

        return [
            'id' => $invoice->getKey(),
            'invoice_no' => $invoice->invoice_no,
            'invoice_date' => optional($invoice->invoice_date)?->toDateString(),
            'due_date' => optional($invoice->due_date)?->toDateString(),
            'total_amount' => (float) $invoice->total_amount,
            'balance_amount' => (float) $invoice->balance_amount,
            'paid_amount' => $invoice->paidAmount(),
            'age_days' => $ageDays,
            'aging_bucket' => $this->agingBucket($invoice, $ageDays),
            'status' => $status->value,
            'status_label' => $status->label(),
            'customer' => [
                'id' => $invoice->customer?->getKey(),
                'customer_code' => $invoice->customer?->customer_code,
                'company_name' => $invoice->customer?->company_name,
            ],
            'project' => [
                'id' => $invoice->project?->getKey(),
                'project_no' => $invoice->project?->project_no,
                'title' => $invoice->project?->title,
            ],
            'work_order' => [
                'id' => $invoice->workOrder?->getKey(),
                'work_order_no' => $invoice->workOrder?->work_order_no,
                'summary' => $invoice->workOrder?->summary,
            ],
        ];
    }

    /**
     * Build AR summary cards and bucket totals.
     *
     * @param  Collection<int, Invoice>  $invoices
     * @return array<string, mixed>
     */
    private function summary(Collection $invoices): array
    {
        $currentBalance = 0.0;
        $overdueBalance = 0.0;
        $partiallyPaidBalance = 0.0;
        $paidInvoiceCount = 0;
        $paidInvoiceValue = 0.0;
        $bucketTotals = [
            'current' => 0.0,
            'days_1_30' => 0.0,
            'days_31_60' => 0.0,
            'days_61_90' => 0.0,
            'days_91_plus' => 0.0,
        ];

        foreach ($invoices as $invoice) {
            $status = $invoice->currentStatus();
            $balance = round((float) $invoice->balance_amount, 2);
            $ageDays = $this->ageDays($invoice);

            if ($status === InvoiceStatus::Paid) {
                $paidInvoiceCount++;
                $paidInvoiceValue += round((float) $invoice->total_amount, 2);

                continue;
            }

            if ($balance <= 0) {
                continue;
            }

            if ($status === InvoiceStatus::PartiallyPaid || ($status === InvoiceStatus::Overdue && $invoice->paidAmount() > 0)) {
                $partiallyPaidBalance += $balance;
            }

            if ($status === InvoiceStatus::Overdue) {
                $overdueBalance += $balance;
            } else {
                $currentBalance += $balance;
            }

            match ($this->agingBucketKey($invoice, $ageDays)) {
                'days_1_30' => $bucketTotals['days_1_30'] += $balance,
                'days_31_60' => $bucketTotals['days_31_60'] += $balance,
                'days_61_90' => $bucketTotals['days_61_90'] += $balance,
                'days_91_plus' => $bucketTotals['days_91_plus'] += $balance,
                default => $bucketTotals['current'] += $balance,
            };
        }

        return [
            'total_outstanding' => round(array_sum($bucketTotals), 2),
            'current_balance' => round($currentBalance, 2),
            'overdue_balance' => round($overdueBalance, 2),
            'partially_paid_balance' => round($partiallyPaidBalance, 2),
            'paid_invoice_count' => $paidInvoiceCount,
            'paid_invoice_value' => round($paidInvoiceValue, 2),
            'bucket_totals' => array_map(
                fn (float $value): float => round($value, 2),
                $bucketTotals,
            ),
        ];
    }

    /**
     * Build shared customer options.
     *
     * @return array<int, array{value:int,label:string}>
     */
    private function customerOptions(): array
    {
        return Customer::query()
            ->orderBy('company_name')
            ->get(['id', 'customer_code', 'company_name'])
            ->map(fn (Customer $customer) => [
                'value' => $customer->getKey(),
                'label' => "{$customer->customer_code} - {$customer->company_name}",
            ])
            ->all();
    }

    /**
     * Build report status options.
     *
     * @return array<int, array{value:string,label:string}>
     */
    private function statusOptions(): array
    {
        return collect([
            InvoiceStatus::Issued,
            InvoiceStatus::PartiallyPaid,
            InvoiceStatus::Overdue,
            InvoiceStatus::Paid,
        ])->map(fn (InvoiceStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ])->values()->all();
    }

    /**
     * Resolve the aging bucket label for the invoice.
     */
    private function agingBucket(Invoice $invoice, ?int $ageDays): string
    {
        return match ($this->agingBucketKey($invoice, $ageDays)) {
            'days_1_30' => '1-30 days',
            'days_31_60' => '31-60 days',
            'days_61_90' => '61-90 days',
            'days_91_plus' => '91+ days',
            'paid' => 'Paid',
            default => 'Current',
        };
    }

    /**
     * Resolve the canonical aging bucket key.
     */
    private function agingBucketKey(Invoice $invoice, ?int $ageDays): string
    {
        if ($invoice->currentStatus() === InvoiceStatus::Paid) {
            return 'paid';
        }

        if ($ageDays === null || $ageDays <= 0) {
            return 'current';
        }

        return match (true) {
            $ageDays <= 30 => 'days_1_30',
            $ageDays <= 60 => 'days_31_60',
            $ageDays <= 90 => 'days_61_90',
            default => 'days_91_plus',
        };
    }

    /**
     * Resolve the overdue age in days, if any.
     */
    private function ageDays(Invoice $invoice): ?int
    {
        if ($invoice->due_date === null || (float) $invoice->balance_amount <= 0) {
            return null;
        }

        return $invoice->due_date->isPast()
            ? $invoice->due_date->diffInDays(now())
            : 0;
    }

    /**
     * Normalize a date filter string.
     */
    private function normalizeDateFilter(string $value): ?string
    {
        return filled($value) ? $value : null;
    }

    /**
     * Resolve a supported page size for paginated listings.
     */
    private function resolvePerPage(Request $request): int
    {
        $perPage = $request->integer('per_page', self::PER_PAGE);

        return in_array($perPage, self::PER_PAGE_OPTIONS, true)
            ? $perPage
            : self::PER_PAGE;
    }
}
