<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'OWNER',
                'display_name' => 'Owner',
                'permissions' => ['*'],
            ],
            [
                'name' => 'ADMIN',
                'display_name' => 'Admin',
                'permissions' => UserRole::ADMIN->permissions(),
            ],
            [
                'name' => 'KASIR_PABRIK',
                'display_name' => 'Kasir Pabrik',
                'permissions' => UserRole::KASIR_PABRIK->permissions(),
            ],
            [
                'name' => 'SUPPLIER',
                'display_name' => 'Supplier',
                'permissions' => UserRole::SUPPLIER->permissions(),
            ],
            [
                'name' => 'VIEWER',
                'display_name' => 'Viewer',
                'permissions' => UserRole::VIEWER->permissions(),
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
