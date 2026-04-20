<?php

namespace App\Enums;

enum TaxCertificateType: string
{
    case Form2316 = '2316';
    case Form2307 = '2307';

    /**
     * Get a human-readable label for the certificate type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Form2316 => 'Form 2316',
            self::Form2307 => 'Form 2307',
        };
    }
}
