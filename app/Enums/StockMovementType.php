<?php

namespace App\Enums;

enum StockMovementType: string
{
    case StockIn = 'stock_in';
    case StockOut = 'stock_out';
    case AdjustmentIncrease = 'adjustment_increase';
    case AdjustmentDecrease = 'adjustment_decrease';
    case Issuance = 'issuance';
    case Return = 'return';

    /**
     * Get a human readable label for the movement type.
     */
    public function label(): string
    {
        return match ($this) {
            self::StockIn => 'Stock In',
            self::StockOut => 'Stock Out',
            self::AdjustmentIncrease => 'Adjustment Increase',
            self::AdjustmentDecrease => 'Adjustment Decrease',
            self::Issuance => 'Issuance',
            self::Return => 'Return',
        };
    }

    /**
     * Determine if the movement adds to stock.
     */
    public function isInbound(): bool
    {
        return in_array($this, [
            self::StockIn,
            self::AdjustmentIncrease,
            self::Return,
        ], true);
    }

    /**
     * Determine if the movement reduces stock.
     */
    public function isOutbound(): bool
    {
        return in_array($this, [
            self::StockOut,
            self::AdjustmentDecrease,
            self::Issuance,
        ], true);
    }

    /**
     * Determine if the type is allowed for manual entry.
     */
    public function isManualEntry(): bool
    {
        return in_array($this, [
            self::StockIn,
            self::StockOut,
            self::AdjustmentIncrease,
            self::AdjustmentDecrease,
        ], true);
    }
}
