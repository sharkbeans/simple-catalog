<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call the admin user seeder
        $this->call(AdminUserSeeder::class);

        // Call the product seeder
        $this->call(ProductSeeder::class);
    }
}
