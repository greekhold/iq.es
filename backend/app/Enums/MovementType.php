<?php

namespace App\Enums;

enum MovementType: string
{
    case PRODUCTION_IN = 'PRODUCTION_IN';
    case SALE_FACTORY = 'SALE_FACTORY';
    case SALE_FIELD = 'SALE_FIELD';
    case ADJUSTMENT = 'ADJUSTMENT';
    case RETURN = 'RETURN';

    public function label(): string
    {
        return match ($this) {
            self::PRODUCTION_IN => 'Produksi Masuk',
            self::SALE_FACTORY => 'Penjualan Pabrik',
            self::SALE_FIELD => 'Penjualan Lapangan',
            self::ADJUSTMENT => 'Penyesuaian',
            self::RETURN => 'Retur',
        };
    }

    public function isAddition(): bool
    {
        return in_array($this, [self::PRODUCTION_IN, self::RETURN , self::ADJUSTMENT]);
    }

    public function isSubtraction(): bool
    {
        return in_array($this, [self::SALE_FACTORY, self::SALE_FIELD]);
    }
}
