<?php

namespace App\Enums;

enum CustomerType: string
{
    case RETAIL = 'RETAIL';
    case AGEN = 'AGEN';
    case RESELLER = 'RESELLER';

    public function label(): string
    {
        return match ($this) {
            self::RETAIL => 'Retail',
            self::AGEN => 'Agen',
            self::RESELLER => 'Reseller',
        };
    }
}
