<?php

namespace App\Enums;

enum TaxReportType: string
{
    case Form1601C = '1601_c';
    case Form1604C = '1604_c';
    case Form2316 = '2316';
    case Form2307 = '2307';
    case Form1601E = '1601_e';
    case Form1601EQ = '1601_eq';
    case VatSummary = 'vat_summary';

    /**
     * Get a human-readable label for the report type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Form1601C => 'Form 1601-C',
            self::Form1604C => 'Form 1604-C',
            self::Form2316 => 'Form 2316',
            self::Form2307 => 'Form 2307',
            self::Form1601E => 'Form 1601-E',
            self::Form1601EQ => 'Form 1601-EQ',
            self::VatSummary => 'VAT Summary',
        };
    }

    /**
     * Determine whether the report pulls withholding source records.
     */
    public function usesWithholdingRecords(): bool
    {
        return match ($this) {
            self::Form1601C,
            self::Form1604C,
            self::Form2316,
            self::Form2307,
            self::Form1601E,
            self::Form1601EQ => true,
            self::VatSummary => false,
        };
    }

    /**
     * Determine whether the report pulls VAT source records.
     */
    public function usesVatRecords(): bool
    {
        return $this === self::VatSummary;
    }
}
