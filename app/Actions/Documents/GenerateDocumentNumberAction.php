<?php

namespace App\Actions\Documents;

use App\Models\DocumentSequence;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class GenerateDocumentNumberAction
{
    private const TYPE_CUSTOMER = 'customer';

    private const TYPE_SITE = 'site';

    /**
     * @var array<string, string>
     */
    private const PREFIXES = [
        self::TYPE_CUSTOMER => 'CUST',
        self::TYPE_SITE => 'SITE',
    ];

    public function handle(string $documentType, ?CarbonInterface $issuedAt = null): string
    {
        $prefix = self::PREFIXES[$documentType] ?? null;

        if ($prefix === null) {
            throw new InvalidArgumentException("Unsupported document type [{$documentType}].");
        }

        $timestamp = ($issuedAt ?? now())->copy();
        $periodKey = $timestamp->format('my');

        $sequence = DB::transaction(function () use ($documentType, $periodKey, $timestamp): int {
            DocumentSequence::query()->upsert(
                [[
                    'document_type' => $documentType,
                    'period_key' => $periodKey,
                    'last_number' => 0,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]],
                ['document_type', 'period_key'],
                ['updated_at'],
            );

            $documentSequence = DocumentSequence::query()
                ->where('document_type', $documentType)
                ->where('period_key', $periodKey)
                ->lockForUpdate()
                ->firstOrFail();

            $documentSequence->last_number++;
            $documentSequence->save();

            return $documentSequence->last_number;
        }, attempts: 5);

        return sprintf('%s-%s-%04d', $prefix, $periodKey, $sequence);
    }

    public function forCustomer(?CarbonInterface $issuedAt = null): string
    {
        return $this->handle(self::TYPE_CUSTOMER, $issuedAt);
    }

    public function forSite(?CarbonInterface $issuedAt = null): string
    {
        return $this->handle(self::TYPE_SITE, $issuedAt);
    }
}
