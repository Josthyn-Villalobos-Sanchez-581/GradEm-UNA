<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
class RegistroControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected $usuarioExistente;

    protected function setUp(): void
    {
        parent::setUp();

        // Evitar middlewares
        $this->withoutMiddleware();

        // Crear un usuario existente para pruebas de correo duplicado
        $this->usuarioExistente = Usuario::factory()->withCredencial()->create([
            'correo' => 'existente@correo.com'
        ]);
    }

    #[Test]
    public function mostrar_formulario_registro()
    {
        $response = $this->get(route('registro.form'));

        $response->assertStatus(200)
                 ->assertInertia(fn ($page) => $page
                    ->component('Registro')
                 );
    }

    #[Test]
    public function enviar_codigo_exitoso()
    {
        Mail::fake();

        $response = $this->post('/registro/enviar-codigo', [
            'correo' => 'nuevo@correo.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Código enviado']);

        // Verificar que la sesión tenga OTP
        $this->assertEquals('nuevo@correo.com', session('otp_correo'));
        $this->assertNotNull(session('otp_codigo'));
        $this->assertNotNull(session('otp_expires_at'));
    }

    #[Test]
    public function enviar_codigo_correo_ya_registrado()
    {
        $response = $this->post('/registro/enviar-codigo', [
            'correo' => $this->usuarioExistente->correo
        ]);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Este correo ya está registrado']);
    }

    #[Test]
    public function validar_codigo_exitoso()
    {
        $codigo = '123456';
        session([
            'otp_correo' => 'validar@correo.com',
            'otp_codigo' => $codigo,
            'otp_expires_at' => now()->addMinutes(5)
        ]);

        $response = $this->post('/registro/validar-codigo', [
            'correo' => 'validar@correo.com',
            'codigo' => $codigo
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Correo validado']);

        $this->assertTrue(session('otp_validado'));
    }

    #[Test]
    public function validar_codigo_invalido_o_expirado()
    {
        $codigo = '123456';
        session([
            'otp_correo' => 'validar@correo.com',
            'otp_codigo' => $codigo,
            'otp_expires_at' => now()->subMinute()
        ]);

        $response = $this->post('/registro/validar-codigo', [
            'correo' => 'validar@correo.com',
            'codigo' => '654321'
        ]);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Código inválido o expirado']);
    }

    #[Test]
    public function registrar_usuario_exitoso()
    {
        $codigo = '123456';
        session([
            'otp_correo' => 'nuevo@correo.com',
            'otp_codigo' => $codigo,
            'otp_expires_at' => now()->addMinutes(5),
            'otp_validado' => true
        ]);

        $response = $this->post('/registro', [
            'correo' => 'nuevo@correo.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'nombre_completo' => 'Juan Perez',
            'identificacion' => '12345678',
            'tipoCuenta' => 'estudiante_egresado'
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Usuario registrado correctamente']);

        $usuario = Usuario::where('correo', 'nuevo@correo.com')->first();
        $this->assertNotNull($usuario);

        $credencial = Credencial::where('id_usuario', $usuario->id_usuario)->first();
        $this->assertTrue(Hash::check('Password123!', $credencial->hash_contrasena));

        // La sesión OTP debe limpiarse
        $this->assertNull(session('otp_correo'));
        $this->assertNull(session('otp_codigo'));
        $this->assertNull(session('otp_expires_at'));
        $this->assertNull(session('otp_validado'));
    }

    #[Test]
    public function registrar_sin_validar_correo()
    {
        session()->forget(['otp_validado', 'otp_correo']);

        $response = $this->post('/registro', [
            'correo' => 'nuevo@correo.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'nombre_completo' => 'Juan Perez',
            'identificacion' => '12345678',
            'tipoCuenta' => 'estudiante_egresado'
        ]);

        $response->assertStatus(422)
                 ->assertJson(['message' => 'Debe validar su correo primero']);
    }

    #[Test]
    public function registrar_correo_duplicado()
    {
        $codigo = '123456';
        session([
            'otp_correo' => $this->usuarioExistente->correo,
            'otp_codigo' => $codigo,
            'otp_expires_at' => now()->addMinutes(5),
            'otp_validado' => true
        ]);

        $response = $this->post('/registro', [
            'correo' => $this->usuarioExistente->correo,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'nombre_completo' => 'Juan Perez',
            'identificacion' => '87654321',
            'tipoCuenta' => 'estudiante_egresado'
        ], ['Accept' => 'application/json']);
        $response->assertStatus(422)
                  ->assertJsonFragment([
             'message' => 'El correo ya está registrado.'
        ]);
    }
}
