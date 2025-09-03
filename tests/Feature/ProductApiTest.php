<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_public_can_access_products_without_authentication(): void
    {
        Product::factory(3)->create();

        $response = $this->getJson('/api/products/public');
        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_unauthenticated_user_cannot_access_products(): void
    {
        $response = $this->getJson('/api/products');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_get_all_products(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Product::factory(3)->create();

        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_authenticated_user_can_create_product(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $productData = [
            'name' => 'Test Product',
            'price' => 29.99,
            'quantity' => 10,
            'image_url' => 'https://example.com/image.jpg'
        ];

        $response = $this->postJson('/api/products', $productData);
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'name' => 'Test Product',
                     'price' => '29.99', // Price is cast as string
                     'quantity' => 10,
                     'image_url' => 'https://example.com/image.jpg'
                 ]);

        $this->assertDatabaseHas('products', $productData);
    }

    public function test_create_product_validation_fails_with_invalid_data(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $invalidData = [
            'name' => '', // Empty name
            'price' => -10, // Negative price
            'quantity' => -5, // Negative quantity
            'image_url' => 'invalid-url' // Invalid URL
        ];

        $response = $this->postJson('/api/products', $invalidData);
        $response->assertStatus(422)
                 ->assertJsonStructure(['errors']);
    }

    public function test_authenticated_user_can_get_single_product(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::factory()->create();

        $response = $this->getJson("/api/products/{$product->id}");
        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'id' => $product->id,
                     'name' => $product->name,
                     'price' => $product->price,
                     'quantity' => $product->quantity
                 ]);
    }

    public function test_authenticated_user_can_update_product(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::factory()->create();
        $updateData = [
            'name' => 'Updated Product',
            'price' => 39.99,
            'quantity' => 15
        ];

        $response = $this->putJson("/api/products/{$product->id}", $updateData);
        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'name' => 'Updated Product',
                     'price' => '39.99', // Price is cast as string
                     'quantity' => 15
                 ]);

        $this->assertDatabaseHas('products', array_merge(['id' => $product->id], $updateData));
    }

    public function test_authenticated_user_can_delete_product(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::factory()->create();

        $response = $this->deleteJson("/api/products/{$product->id}");
        $response->assertStatus(204);

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_get_nonexistent_product_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/products/999');
        $response->assertStatus(404);
    }

    public function test_update_nonexistent_product_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $updateData = ['name' => 'Updated Product'];

        $response = $this->putJson('/api/products/999', $updateData);
        $response->assertStatus(404);
    }

    public function test_delete_nonexistent_product_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/products/999');
        $response->assertStatus(404);
    }
}
