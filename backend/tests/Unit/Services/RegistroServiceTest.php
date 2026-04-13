<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\RegistroServices\RegistroService;
use App\Repositories\RegistroRepositories\RegistroRepository;
use App\Repositories\MailRepositories\MailRepository;
use App\Models\Usuario;
use App\Models\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class RegistroServiceTest extends TestCase
{
    private $registroRepositoryMock;
    private $mailRepositoryMock;
    private RegistroService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->registroRepositoryMock = $this->mock(RegistroRepository::class);
        $this->mailRepositoryMock     = $this->mock(MailRepository::class);

        $this->service = new RegistroService(
            $this->registroRepositoryMock,
            $this->mailRepositoryMock
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────
    // enviarCodigo
    // ─────────────────────────────────────────

    #[Test]
    public function test_enviar_codigo_correctamente()
    {
        $request = Request::create('/registro/enviar-codigo', 'POST', [
            'correo' => 'usuario@test.com'
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('correoExiste')
            ->once()
            ->with('usuario@test.com')
            ->andReturn(false);

        $this->mailRepositoryMock
            ->shouldReceive('enviarCorreo')
            ->once();

        $respuesta = $this->service->enviarCodigo($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(200, $respuesta->status());
        $this->assertEquals('Código enviado correctamente', $respuesta->getData()->message);
    }

    #[Test]
    public function test_enviar_codigo_falla_si_correo_ya_existe()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Este correo ya está registrado');

        $request = Request::create('/registro/enviar-codigo', 'POST', [
            'correo' => 'existente@test.com'
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('correoExiste')
            ->once()
            ->andReturn(true);

        $this->mailRepositoryMock
            ->shouldNotReceive('enviarCorreo');

        $this->service->enviarCodigo($request);
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

        $request = Request::create('/registro/validar-codigo', 'POST', [
            'correo' => 'usuario@test.com',
            'codigo' => 123456
        ]);

        $respuesta = $this->service->validarCodigo($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(200, $respuesta->status());
        $this->assertEquals('Correo validado correctamente', $respuesta->getData()->message);
        $this->assertTrue(session('otp_validado'));
    }

    #[Test]
    public function test_validar_codigo_falla_si_correo_no_coincide()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Código inválido o expirado');

        Session::put('otp_correo', 'otro@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $request = Request::create('/registro/validar-codigo', 'POST', [
            'correo' => 'usuario@test.com',
            'codigo' => 123456
        ]);

        $this->service->validarCodigo($request);
    }

    #[Test]
    public function test_validar_codigo_falla_si_codigo_incorrecto()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Código inválido o expirado');

        Session::put('otp_correo', 'usuario@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $request = Request::create('/registro/validar-codigo', 'POST', [
            'correo' => 'usuario@test.com',
            'codigo' => 999999
        ]);

        $this->service->validarCodigo($request);
    }

    #[Test]
    public function test_validar_codigo_falla_si_otp_expirado()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Código inválido o expirado');

        Session::put('otp_correo', 'usuario@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->subMinutes(10));

        $request = Request::create('/registro/validar-codigo', 'POST', [
            'correo' => 'usuario@test.com',
            'codigo' => 123456
        ]);

        $this->service->validarCodigo($request);
    }

    // ─────────────────────────────────────────
    // registrar
    // ─────────────────────────────────────────

    #[Test]
    public function test_registrar_usuario_correctamente()
    {
        Session::put('otp_validado', true);
        Session::put('otp_correo', 'usuario@test.com');

        $request = Request::create('/registro', 'POST', [
            'correo'            => 'usuario@test.com',
            'password'          => 'password123',
            'password_confirmation' => 'password123',
            'nombre_completo'   => 'Juan Perez',
            'identificacion'    => 'ABC12345',
            'tipoCuenta'        => 'estudiante',
        ]);

        $rol = new Rol();
        $rol->id_rol = 6;
        $rol->nombre_rol = 'Estudiante';

        $usuario = new Usuario();
        $usuario->id_usuario = 1;

        $this->registroRepositoryMock
            ->shouldReceive('validarDatosRegistro')
            ->once()
            ->andReturn([
                'correo'          => 'usuario@test.com',
                'nombre_completo' => 'Juan Perez',
                'identificacion'  => 'ABC12345',
                'tipoCuenta'      => 'estudiante',
            ]);

        $this->registroRepositoryMock
            ->shouldReceive('obtenerRolPorTipoCuenta')
            ->once()
            ->with('estudiante')
            ->andReturn($rol);

        $this->registroRepositoryMock
            ->shouldReceive('crearUsuario')
            ->once()
            ->andReturn($usuario);

        $this->registroRepositoryMock
            ->shouldReceive('crearCredencial')
            ->once();

        $respuesta = $this->service->registrar($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(200, $respuesta->status());
        $this->assertEquals('Usuario registrado correctamente', $respuesta->getData()->message);
        $this->assertEquals(1, $respuesta->getData()->usuario);
    }

    #[Test]
    public function test_registrar_falla_si_otp_no_validado()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Debe validar su correo primero');

        Session::forget('otp_validado');
        Session::put('otp_correo', 'usuario@test.com');

        $request = Request::create('/registro', 'POST', [
            'correo'                => 'usuario@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'nombre_completo'       => 'Juan Perez',
            'identificacion'        => 'ABC12345',
            'tipoCuenta'            => 'estudiante',
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('validarDatosRegistro')
            ->once()
            ->andReturn([]);

        $this->service->registrar($request);
    }

    #[Test]
    public function test_registrar_falla_si_correo_no_coincide_con_otp()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Debe validar su correo primero');

        Session::put('otp_validado', true);
        Session::put('otp_correo', 'otro@test.com');

        $request = Request::create('/registro', 'POST', [
            'correo'                => 'usuario@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'nombre_completo'       => 'Juan Perez',
            'identificacion'        => 'ABC12345',
            'tipoCuenta'            => 'estudiante',
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('validarDatosRegistro')
            ->once()
            ->andReturn([]);

        $this->service->registrar($request);
    }

    #[Test]
    public function test_registrar_falla_si_rol_no_encontrado()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Rol no encontrado. Por favor, contacte al administrador');

        Session::put('otp_validado', true);
        Session::put('otp_correo', 'usuario@test.com');

        $request = Request::create('/registro', 'POST', [
            'correo'                => 'usuario@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'nombre_completo'       => 'Juan Perez',
            'identificacion'        => 'ABC12345',
            'tipoCuenta'            => 'estudiante',
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('validarDatosRegistro')
            ->once()
            ->andReturn([]);

        $this->registroRepositoryMock
            ->shouldReceive('obtenerRolPorTipoCuenta')
            ->once()
            ->andReturn(null);

        $this->service->registrar($request);
    }

    // ─────────────────────────────────────────
    // verificarCorreo
    // ─────────────────────────────────────────

    #[Test]
    public function test_verificar_correo_existente()
    {
        $request = Request::create('/verificar-correo', 'POST', [
            'correo' => 'existente@test.com'
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('correoExiste')
            ->once()
            ->with('existente@test.com')
            ->andReturn(true);

        $respuesta = $this->service->verificarCorreo($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertTrue($respuesta->getData()->exists);
    }

    #[Test]
    public function test_verificar_correo_no_existente()
    {
        $request = Request::create('/verificar-correo', 'POST', [
            'correo' => 'nuevo@test.com'
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('correoExiste')
            ->once()
            ->with('nuevo@test.com')
            ->andReturn(false);

        $respuesta = $this->service->verificarCorreo($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertFalse($respuesta->getData()->exists);
    }

    // ─────────────────────────────────────────
    // verificarIdentificacion
    // ─────────────────────────────────────────

    #[Test]
    public function test_verificar_identificacion_existente()
    {
        $request = Request::create('/verificar-identificacion', 'POST', [
            'identificacion' => 'ABC12345'
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('identificacionExiste')
            ->once()
            ->with('ABC12345')
            ->andReturn(true);

        $respuesta = $this->service->verificarIdentificacion($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertTrue($respuesta->getData()->exists);
    }

    #[Test]
    public function test_verificar_identificacion_no_existente()
    {
        $request = Request::create('/verificar-identificacion', 'POST', [
            'identificacion' => 'XYZ99999'
        ]);

        $this->registroRepositoryMock
            ->shouldReceive('identificacionExiste')
            ->once()
            ->with('XYZ99999')
            ->andReturn(false);

        $respuesta = $this->service->verificarIdentificacion($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertFalse($respuesta->getData()->exists);
    }
}