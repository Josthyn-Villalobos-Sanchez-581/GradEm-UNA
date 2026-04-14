<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Models\Rol;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;

class RegistroControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    // ─────────────────────────────────────────
    // mostrarFormulario
    // ─────────────────────────────────────────

    #[Test]
    public function test_mostrar_formulario_retorna_vista_correcta()
    {
        $response = $this->withHeaders(['X-Inertia' => 'true'])
                         ->getJson('/registro');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Registro');
    }

    // ─────────────────────────────────────────
    // enviarCodigo
    // ─────────────────────────────────────────

    #[Test]
    public function test_enviar_codigo_correctamente()
    {
        Mail::fake();

        $response = $this->postJson('/registro/enviar-codigo', [
            'correo' => 'nuevo_' . uniqid() . '@test.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Código enviado correctamente'
                 ]);
    }

    #[Test]
    public function test_enviar_codigo_falla_si_correo_ya_existe()
    {
        Mail::fake();

        $usuario = Usuario::factory()->create();

        $response = $this->postJson('/registro/enviar-codigo', [
            'correo' => $usuario->correo
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Este correo ya está registrado'
                 ]);
    }

    #[Test]
    public function test_enviar_codigo_falla_sin_correo()
    {
        $response = $this->postJson('/registro/enviar-codigo', []);

        $response->assertStatus(422);
    }

    // ─────────────────────────────────────────
    // validarCodigo
    // ─────────────────────────────────────────

    #[Test]
    public function test_validar_codigo_correctamente()
    {
        Session::put('otp_correo', 'usuario@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $response = $this->postJson('/registro/validar-codigo', [
            'correo' => 'usuario@test.com',
            'codigo' => 123456
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Correo validado correctamente'
                 ]);
    }

    #[Test]
    public function test_validar_codigo_falla_si_codigo_incorrecto()
    {
        Session::put('otp_correo', 'usuario@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $response = $this->postJson('/registro/validar-codigo', [
            'correo' => 'usuario@test.com',
            'codigo' => 999999
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Código inválido o expirado'
                 ]);
    }

    #[Test]
    public function test_validar_codigo_falla_si_otp_expirado()
    {
        Session::put('otp_correo', 'usuario@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->subMinutes(10));

        $response = $this->postJson('/registro/validar-codigo', [
            'correo' => 'usuario@test.com',
            'codigo' => 123456
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Código inválido o expirado'
                 ]);
    }

    #[Test]
    public function test_validar_codigo_falla_si_correo_no_coincide()
    {
        Session::put('otp_correo', 'otro@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $response = $this->postJson('/registro/validar-codigo', [
            'correo' => 'usuario@test.com',
            'codigo' => 123456
        ]);

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Código inválido o expirado'
                 ]);
    }

    // ─────────────────────────────────────────
    // registrar
    // ─────────────────────────────────────────

    #[Test]
public function test_registrar_usuario_correctamente()
{
    $correo = 'nuevo_' . uniqid() . '@test.com';

    Session::put('otp_validado', true);
    Session::put('otp_correo', $correo);

    $rol = Rol::where('nombre_rol', 'Estudiante')->first();

    if (!$rol) {
        $rol = Rol::factory()->create(['nombre_rol' => 'Estudiante']);
    }

    $response = $this->postJson('/registro', [
        'correo'                => $correo,
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'nombre_completo'       => 'Juan Perez',
        'identificacion'        => 'ABC' . rand(10000, 99999),
        'tipoCuenta'            => 'estudiante',
    ]);

    $response->assertStatus(200)
             ->assertJson([
                 'message' => 'Usuario registrado correctamente'
             ]);

    $this->assertDatabaseHas('usuarios', [
        'correo' => $correo,
    ]);
}

    #[Test]
public function test_registrar_falla_si_otp_no_validado()
{
    Session::forget('otp_validado');
    Session::put('otp_correo', 'usuario@test.com');

    $response = $this->postJson('/registro', [
        'correo'                => 'usuario@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'nombre_completo'       => 'Juan Perez',
        'identificacion'        => 'ABC' . rand(10000, 99999),
        'tipoCuenta'            => 'estudiante',
    ]);

    $response->assertStatus(422)
             ->assertJson([
                 'message' => 'Debe validar su correo primero'
             ]);
}

    #[Test]
public function test_registrar_falla_si_correo_no_coincide_con_otp()
{
    Session::put('otp_validado', true);
    Session::put('otp_correo', 'otro@test.com');

    $response = $this->postJson('/registro', [
        'correo'                => 'diferente@test.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'nombre_completo'       => 'Juan Perez',
        'identificacion'        => 'ABC' . rand(10000, 99999),
        'tipoCuenta'            => 'estudiante',
    ]);

    $response->assertStatus(422)
             ->assertJson([
                 'message' => 'Debe validar su correo primero'
             ]);
}
    #[Test]
    public function test_registrar_falla_sin_datos_requeridos()
    {
        $correo = 'nuevo_' . uniqid() . '@test.com';

        Session::put('otp_validado', true);
        Session::put('otp_correo', $correo);

        $response = $this->postJson('/registro', [
            'correo' => $correo,
        ]);

        $response->assertStatus(422);
    }
}