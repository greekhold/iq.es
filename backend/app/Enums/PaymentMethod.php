<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'CASH';
    case TRANSFER = 'TRANSFER';
    case OTHER = 'OTHER'; // Credit/Hutang - requires due_date

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Tunai',
            self::TRANSFER => 'Transfer',
            self::OTHER => 'Lainnya (Hutang)',
        };
    }

    public function requiresDueDate(): bool
    {
        return $this === self::OTHER;
    }
}
