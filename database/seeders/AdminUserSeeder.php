<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update a superadmin user
        User::updateOrCreate(
            ['email' => 'admin@catalog.local'],
            [
                'name' => 'Super Admin',
                'email_verified_at' => now(),
                'password' => Hash::make('admin123'),
            ]
        );

        $this->command->info('Admin user created/updated successfully!');
        $this->command->info('Email: admin@catalog.local');
        $this->command->info('Password: admin123');
    }
}
