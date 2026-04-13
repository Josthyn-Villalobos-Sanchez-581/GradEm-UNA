<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\EmpresaServices\EmpresaService;
use App\Repositories\EmpresaRepositories\EmpresaRepository;
use App\Repositories\MailRepositories\MailRepository;
use App\Models\Usuario;
use App\Models\Empresa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class EmpresaServiceTest extends TestCase
{
    private $empresaRepositoryMock;
    private $mailRepositoryMock;
    private EmpresaService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->empresaRepositoryMock = $this->mock(EmpresaRepository::class);
        $this->mailRepositoryMock    = $this->mock(MailRepository::class);

        $this->service = new EmpresaService(
            $this->empresaRepositoryMock,
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
        $request = Request::create('/enviar-codigo', 'POST', [
            'correo' => 'empresa@test.com'
        ]);

        $this->empresaRepositoryMock
            ->shouldReceive('correoExisteUsuario')
            ->once()
            ->with('empresa@test.com')
            ->andReturn(false);

        $this->empresaRepositoryMock
            ->shouldReceive('correoExisteEmpresa')
            ->once()
            ->with('empresa@test.com')
            ->andReturn(false);

        $this->empresaRepositoryMock
            ->shouldReceive('enviarCodigo')
            ->once();

        $respuesta = $this->service->enviarCodigo($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(200, $respuesta->status());
        $this->assertEquals('Código enviado correctamente', $respuesta->getData()->message);
    }

    #[Test]
    public function test_enviar_codigo_falla_si_correo_existe_en_usuarios()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Este correo ya está registrado');

        $request = Request::create('/enviar-codigo', 'POST', [
            'correo' => 'existente@test.com'
        ]);

        $this->empresaRepositoryMock
            ->shouldReceive('correoExisteUsuario')
            ->once()
            ->andReturn(true);

        $this->empresaRepositoryMock
            ->shouldNotReceive('correoExisteEmpresa');

        $this->service->enviarCodigo($request);
    }

    #[Test]
    public function test_enviar_codigo_falla_si_correo_existe_en_empresas()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Este correo ya está registrado');

        $request = Request::create('/enviar-codigo', 'POST', [
            'correo' => 'empresa@test.com'
        ]);

        $this->empresaRepositoryMock
            ->shouldReceive('correoExisteUsuario')
            ->once()
            ->andReturn(false);

        $this->empresaRepositoryMock
            ->shouldReceive('correoExisteEmpresa')
            ->once()
            ->andReturn(true);

        $this->service->enviarCodigo($request);
    }

    // ─────────────────────────────────────────
    // validarCodigo
    // ─────────────────────────────────────────

    #[Test]
    public function test_validar_codigo_correctamente()
    {
        Session::put('otp_correo', 'empresa@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $request = Request::create('/validar-codigo', 'POST', [
            'correo' => 'empresa@test.com',
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

        $request = Request::create('/validar-codigo', 'POST', [
            'correo' => 'empresa@test.com',
            'codigo' => 123456
        ]);

        $this->service->validarCodigo($request);
    }

    #[Test]
    public function test_validar_codigo_falla_si_codigo_incorrecto()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Código inválido o expirado');

        Session::put('otp_correo', 'empresa@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->addMinutes(5));

        $request = Request::create('/validar-codigo', 'POST', [
            'correo' => 'empresa@test.com',
            'codigo' => 999999
        ]);

        $this->service->validarCodigo($request);
    }

    #[Test]
    public function test_validar_codigo_falla_si_otp_expirado()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Código inválido o expirado');

        Session::put('otp_correo', 'empresa@test.com');
        Session::put('otp_codigo', 123456);
        Session::put('otp_expires_at', now()->subMinutes(10));

        $request = Request::create('/validar-codigo', 'POST', [
            'correo' => 'empresa@test.com',
            'codigo' => 123456
        ]);

        $this->service->validarCodigo($request);
    }

    // ─────────────────────────────────────────
    // registrar
    // ─────────────────────────────────────────

    #[Test]
    public function test_registrar_empresa_correctamente()
    {
        Session::put('otp_validado', true);
        Session::put('otp_correo', 'empresa@test.com');

        $request = Request::create('/registrar', 'POST', [
            'correo'           => 'empresa@test.com',
            'nombre'           => 'Empresa Test',
            'telefono'         => '88887777',
            'persona_contacto' => 'Juan Perez',
            'identificacion'   => 'ABC12345',
            'password'         => 'password123',
        ]);

        $usuario = new Usuario();
        $usuario->id_usuario = 1;

        $empresa = new Empresa();
        $empresa->id_empresa = 10;

        $this->empresaRepositoryMock
            ->shouldReceive('validarDatosRegistro')
            ->once()
            ->andReturn([]);

        $this->empresaRepositoryMock
            ->shouldReceive('crearUsuario')
            ->once()
            ->andReturn($usuario);

        $this->empresaRepositoryMock
            ->shouldReceive('crearCredencial')
            ->once();

        $this->empresaRepositoryMock
            ->shouldReceive('crearEmpresa')
            ->once()
            ->andReturn($empresa);

        $respuesta = $this->service->registrar($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(200, $respuesta->status());
        $this->assertEquals('Empresa registrada correctamente', $respuesta->getData()->message);
        $this->assertEquals(10, $respuesta->getData()->empresa);
    }

    #[Test]
    public function test_registrar_falla_si_otp_no_validado()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Debe validar su correo primero');

        Session::forget('otp_validado');
        Session::put('otp_correo', 'empresa@test.com');

        $request = Request::create('/registrar', 'POST', [
            'correo' => 'empresa@test.com'
        ]);

        $this->service->registrar($request);
    }

    #[Test]
    public function test_registrar_falla_si_correo_no_coincide_con_otp()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Debe validar su correo primero');

        Session::put('otp_validado', true);
        Session::put('otp_correo', 'otro@test.com');

        $request = Request::create('/registrar', 'POST', [
            'correo' => 'empresa@test.com'
        ]);

        $this->service->registrar($request);
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

        $this->empresaRepositoryMock
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

        $this->empresaRepositoryMock
            ->shouldReceive('identificacionExiste')
            ->once()
            ->with('XYZ99999')
            ->andReturn(false);

        $respuesta = $this->service->verificarIdentificacion($request);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertFalse($respuesta->getData()->exists);
    }

    // ─────────────────────────────────────────
    // listarEmpresas / verEmpresa
    // ─────────────────────────────────────────

    #[Test]
    public function test_listar_empresas()
    {
        $empresas = collect([new Empresa(), new Empresa()]);

        $this->empresaRepositoryMock
            ->shouldReceive('listarEmpresas')
            ->once()
            ->andReturn($empresas);

        $resultado = $this->service->listarEmpresas();

        $this->assertCount(2, $resultado);
    }

    #[Test]
    public function test_ver_empresa()
    {
        $empresa = new Empresa();
        $empresa->id_empresa = 5;

        $this->empresaRepositoryMock
            ->shouldReceive('verEmpresa')
            ->once()
            ->with(5)
            ->andReturn($empresa);

        $resultado = $this->service->verEmpresa(5);

        $this->assertEquals(5, $resultado->id_empresa);
    }
}