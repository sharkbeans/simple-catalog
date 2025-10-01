<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'product_code' => strtoupper($this->faker->bothify('??###')),
            'price' => $this->faker->randomFloat(2, 1, 999),
            'quantity' => $this->faker->numberBetween(0, 100),
            'image_url' => $this->faker->imageUrl(640, 480, 'products', true),
        ];
    }
}
