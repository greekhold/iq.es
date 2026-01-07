<?php

namespace App\Enums;

enum SalesChannel: string
{
    case FACTORY = 'FACTORY';
    case FIELD = 'FIELD';

    public function label(): string
    {
        return match($this) {
            self::FACTORY => 'Penjualan Pabrik',
            self::FIELD => 'Penjualan Lapangan',
        };
    }
}
