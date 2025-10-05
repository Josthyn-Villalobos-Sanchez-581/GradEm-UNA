<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RecuperarContrasenaControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuario;

    protected function setUp(): void
    {
        parent::setUp();

        // Evitar middlewares
        $this->withoutMiddleware();

        // Crear usuario con credencial
        $this->usuario = Usuario::factory()->withCredencial()->create();
    }

    /** @test */
    public function enviar_codigo_exitoso_usuario_existente()
    {
        Mail::fake();

        $response = $this->post('/recuperar/enviar-codigo', [
            'correo' => $this->usuario->correo
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Si el correo es válido, se ha enviado un código']);

        $this->assertNotNull(session('reset_codigo'));
        $this->assertEquals($this->usuario->correo, session('reset_correo'));
    }

    /** @test */
    public function enviar_codigo_usuario_no_existente_devuelve_mensaje_generico()
    {
        Mail::fake();

        $response = $this->post('/recuperar/enviar-codigo', [
            'correo' => 'noexiste@correo.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Si el correo es válido, se ha enviado un código']);
    }

    /** @test */
    public function cambiar_contrasena_exitoso()
    {
        $codigo = '123456'; // ahora como string
        session([
            'reset_correo' => $this->usuario->correo,
            'reset_codigo' => $codigo,
            'reset_expires_at' => now()->addMinutes(5)
        ]);

        $response = $this->post('/recuperar/cambiar-contrasena', [
            'correo' => $this->usuario->correo,
            'codigo' => $codigo,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Contraseña restablecida con éxito']);

        $credencial = Credencial::where('id_usuario', $this->usuario->id_usuario)->first();
        $this->assertTrue(Hash::check('Password123!', $credencial->hash_contrasena));

        $this->assertNull(session('reset_codigo'));
        $this->assertNull(session('reset_correo'));
        $this->assertNull(session('reset_expires_at'));
    }

    /** @test */
    public function cambiar_contrasena_codigo_invalido()
    {
        session([
            'reset_correo' => $this->usuario->correo,
            'reset_codigo' => '123456',
            'reset_expires_at' => now()->addMinutes(5)
        ]);

        $response = $this->post('/recuperar/cambiar-contrasena', [
            'correo' => $this->usuario->correo,
            'codigo' => '654321', // string inválido
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ]);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Código inválido o expirado']);
    }

    /** @test */
    public function cambiar_contrasena_codigo_expirado()
    {
        session([
            'reset_correo' => $this->usuario->correo,
            'reset_codigo' => '123456',
            'reset_expires_at' => now()->subMinute()
        ]);

        $response = $this->post('/recuperar/cambiar-contrasena', [
            'correo' => $this->usuario->correo,
            'codigo' => '123456', // string
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!'
        ]);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Código inválido o expirado']);
    }

    /** @test */
    public function cambiar_contrasena_password_no_confirmada()
    {
        session([
            'reset_correo' => $this->usuario->correo,
            'reset_codigo' => '123456',
            'reset_expires_at' => now()->addMinutes(5)
        ]);

        $response = $this->post('/recuperar/cambiar-contrasena', [
            'correo' => $this->usuario->correo,
            'codigo' => '123456',
            'password' => 'Password123!',
            'password_confirmation' => 'OtroPassword123!'
        ]);

        $response->assertSessionHasErrors('password');
    }

    /** @test */
    public function cambiar_contrasena_password_no_valida_regex()
    {
        session([
            'reset_correo' => $this->usuario->correo,
            'reset_codigo' => '123456',
            'reset_expires_at' => now()->addMinutes(5)
        ]);

        $response = $this->post('/recuperar/cambiar-contrasena', [
            'correo' => $this->usuario->correo,
            'codigo' => '123456',
            'password' => 'password',
            'password_confirmation' => 'password'
        ]);

        $response->assertSessionHasErrors('password');
    }
}
