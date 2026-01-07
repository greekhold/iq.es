<?php

namespace App\Enums;

enum UserRole: string
{
    case OWNER = 'OWNER';
    case ADMIN = 'ADMIN';
    case KASIR_PABRIK = 'KASIR_PABRIK';
    case SUPPLIER = 'SUPPLIER';
    case VIEWER = 'VIEWER';

    public function label(): string
    {
        return match ($this) {
            self::OWNER => 'Owner',
            self::ADMIN => 'Admin',
            self::KASIR_PABRIK => 'Kasir Pabrik',
            self::SUPPLIER => 'Supplier',
            self::VIEWER => 'Viewer',
        };
    }

    public function permissions(): array
    {
        return match ($this) {
            self::OWNER => ['*'],
            self::ADMIN => [
                'users.view',
                'users.create',
                'users.update',
                'products.view',
                'products.create',
                'products.update',
                'prices.view',
                'prices.create',
                'prices.update',
                'customers.view',
                'customers.create',
                'customers.update',
                'production.view',
                'production.create',
                'inventory.view',
                'inventory.adjust',
                'sales.view',
                'sales.create',
                'reports.view',
                'reports.export',
                'sync.view',
                'sync.resolve',
            ],
            self::KASIR_PABRIK => [
                'products.view',
                'prices.view',
                'customers.view',
                'customers.create',
                'production.view',
                'production.create',
                'inventory.view',
                'sales.view',
                'sales.create',
            ],
            self::SUPPLIER => [
                'products.view',
                'prices.view',
                'customers.view',
                'customers.create',
                'sales.view',
                'sales.create',
                'sync.push',
            ],
            self::VIEWER => [
                'reports.view',
                'inventory.view',
                'sales.view',
                'production.view',
            ],
        };
    }

    public function canAccessChannel(SalesChannel $channel): bool
    {
        return match ($this) {
            self::OWNER, self::ADMIN => true,
            self::KASIR_PABRIK => $channel === SalesChannel::FACTORY,
            self::SUPPLIER => $channel === SalesChannel::FIELD,
            self::VIEWER => false,
        };
    }
}
