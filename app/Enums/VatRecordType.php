<?php

namespace App\Enums;

enum VatRecordType: string
{
    case OutputVat = 'output_vat';
    case InputVat = 'input_vat';

    /**
     * Get a human-readable label for the VAT record type.
     */
    public function label(): string
    {
        return match ($this) {
            self::OutputVat => 'Output VAT',
            self::InputVat => 'Input VAT',
        };
    }
}
