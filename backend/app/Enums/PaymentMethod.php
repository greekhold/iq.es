<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'CASH';
    case TRANSFER = 'TRANSFER';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Tunai',
            self::TRANSFER => 'Transfer',
        };
    }
}
