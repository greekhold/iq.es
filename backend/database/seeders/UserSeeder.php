<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $ownerRole = Role::where('name', 'OWNER')->first();
        $adminRole = Role::where('name', 'ADMIN')->first();
        $kasirRole = Role::where('name', 'KASIR_PABRIK')->first();
        $supplierRole = Role::where('name', 'SUPPLIER')->first();

        // Create Owner
        User::updateOrCreate(
            ['email' => 'owner@iq.es'],
            [
                'name' => 'Owner IQ.es',
                'password' => Hash::make('password123'),
                'role_id' => $ownerRole?->id,
                'status' => 'active',
            ]
        );

        // Create Admin
        User::updateOrCreate(
            ['email' => 'admin@iq.es'],
            [
                'name' => 'Admin IQ.es',
                'password' => Hash::make('password123'),
                'role_id' => $adminRole?->id,
                'status' => 'active',
            ]
        );

        // Create Kasir
        User::updateOrCreate(
            ['email' => 'kasir@iq.es'],
            [
                'name' => 'Kasir Pabrik',
                'password' => Hash::make('password123'),
                'role_id' => $kasirRole?->id,
                'status' => 'active',
            ]
        );

        // Create Supplier
        User::updateOrCreate(
            ['email' => 'supplier@iq.es'],
            [
                'name' => 'Supplier Lapangan',
                'password' => Hash::make('password123'),
                'role_id' => $supplierRole?->id,
                'status' => 'active',
            ]
        );
    }
}
