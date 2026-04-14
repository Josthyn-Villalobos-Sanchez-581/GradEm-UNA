<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Services\AuthServices\AuthService;
use Mockery;
use PHPUnit\Framework\Attributes\Test; 
class AuthControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = Mockery::mock(AuthService::class);

        // Reemplazar el service real por el mock
        $this->app->instance(AuthService::class, $this->service);
           $this->withoutVite();
        $this->withoutMiddleware();
    }

   #[Test]
    public function login_exitoso()
    {
        $data = [
            'correo' => 'test@email.com',
            'password' => 'Password123!'
        ];

        $this->service
            ->shouldReceive('login')
            ->once()
            ->with($data)
            ->andReturn(response()->json(['status' => 'success'], 200));

        $response = $this->postJson('/login', $data);

        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);
    }

    #[Test]
    public function login_falla_por_validacion()
    {
        $response = $this->postJson('/login', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['correo', 'password']);
    }

    #[Test]
    public function logout_exitoso()
    {
        $this->service
            ->shouldReceive('logout')
            ->once()
            ->andReturn(response()->json(['status' => 'logout'], 200));

        $response = $this->postJson('/logout');

        $response->assertStatus(200)
                 ->assertJson(['status' => 'logout']);
    }

    }
