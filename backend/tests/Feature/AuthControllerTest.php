<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Services\AuthServices\AuthService;
use Mockery;
use PHPUnit\Framework\Attributes\Test; 
use App\Models\Usuario; 
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
 protected function tearDown(): void
    {
        Mockery::close(); // ← faltaba esto
        parent::tearDown();
    }

   #[Test]
public function login_exitoso()
{
    $data = ['correo' => 'test@test.com', 'password' => 'password123'];

    $this->service
        ->shouldReceive('login')
        ->once()
        ->withAnyArgs() // ← acepta cualquier argumento
        ->andReturn(response()->json(['redirect' => '/dashboard'], 200));

    $response = $this->postJson('/login', $data);

    $response->assertStatus(302);
}

    #[Test]
    public function login_falla_por_validacion()
    {
        $response = $this->postJson('/login', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['correo', 'password']);
    }

    #[Test]
public function login_credenciales_invalidas()
{
    $data = ['correo' => 'test@test.com', 'password' => 'wrongpassword'];

    $this->service
        ->shouldReceive('login')
        ->once()
        ->andReturn(response()->json(['message' => 'Credenciales inválidas'], 401));

    $response = $this->post('/login', $data);

    // back()->withErrors() → 302 con errores en sesión
    $response->assertStatus(302);
    $response->assertSessionHasErrors('correo');
}

#[Test]
public function logout_exitoso()
{
    $usuario = Usuario::factory()->create();

    $this->service
        ->shouldReceive('logout')
        ->once();

    $response = $this->actingAs($usuario, 'sanctum')
        ->post('/logout');

    // logout siempre hace redirect('/login') → 302
    $response->assertStatus(302);
    $response->assertRedirect('/login');
}

    }
