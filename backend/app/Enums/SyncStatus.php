<?php

namespace App\Enums;

enum SyncStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case SYNCED = 'synced';
    case FAILED = 'failed';
    case CONFLICT = 'conflict';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Sync',
            self::PROCESSING => 'Sedang Proses',
            self::SYNCED => 'Tersinkronisasi',
            self::FAILED => 'Gagal',
            self::CONFLICT => 'Konflik',
        };
    }
}
