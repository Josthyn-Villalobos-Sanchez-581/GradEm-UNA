<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Repositories\AuthRepositories\AuthRepository;
use App\Models\Usuario;
use App\Models\Credencial;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Mockery;
use App\Services\AuthServices\AuthService;

class AuthServiceTest extends TestCase
{

    protected $repository;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(AuthRepository::class);
       $this->service = new AuthService($this->repository);
    }

  protected function tearDown(): void
{
    Mockery::close();
    parent::tearDown();
}

    #[Test]
    public function login_falla_si_usuario_no_existe()
    {
        $correo = "test@email.com";

        $this->repository->shouldReceive('limpiarCorreosExpirados');
        $this->repository->shouldReceive('buscarUsuarioPorCorreo')
            ->andReturn(null);

        $this->repository->shouldReceive('obtenerIntentosCorreo')
            ->andReturn(null);

        $this->repository->shouldReceive('obtenerEstadoIds')
            ->andReturn([]);

        $this->repository->shouldReceive('registrarIntentoCorreo')
            ->andReturn(1);

        $response = $this->service->login([
            'correo' => $correo,
            'password' => '123456'
        ]);

        $this->assertEquals(422, $response->status());
    }

    #[Test]
    public function login_falla_si_contrasena_incorrecta()
    {
        $usuario = new Usuario();
        $usuario->id_usuario = 1;
        $usuario->correo = "test@email.com";
        $usuario->estado_id = 1;

        $credencial = new Credencial();
        $credencial->hash_contrasena = Hash::make("passwordCorrecta");
        $credencial->intentos_fallidos = 0;

        $this->repository->shouldReceive('limpiarCorreosExpirados');
        $this->repository->shouldReceive('buscarUsuarioPorCorreo')
            ->andReturn($usuario);

        $this->repository->shouldReceive('obtenerIntentosCorreo')
            ->andReturn(null);

        $this->repository->shouldReceive('obtenerEstadoIds')
            ->andReturn([
                'activo' => 1,
                'inactivo' => 2,
                'suspendido' => 3
            ]);

        $this->repository->shouldReceive('obtenerCredencial')
            ->andReturn($credencial);

        $this->repository->shouldReceive('guardarCredencial');

        $response = $this->service->login([
            'correo' => $usuario->correo,
            'password' => 'passwordIncorrecta'
        ]);

        $this->assertEquals(422, $response->status());
    }

    #[Test]
    public function login_correcto_retorna_redirect()
    {
        $usuario = new Usuario();
        $usuario->id_usuario = 1;
        $usuario->correo = "test@email.com";
        $usuario->estado_id = 1;
        $usuario->sesion_activa = false;

        $credencial = new Credencial();
        $credencial->hash_contrasena = Hash::make("passwordCorrecta");
        $credencial->intentos_fallidos = 0;

        $this->repository->shouldReceive('limpiarCorreosExpirados');
        $this->repository->shouldReceive('buscarUsuarioPorCorreo')
            ->andReturn($usuario);

        $this->repository->shouldReceive('obtenerIntentosCorreo')
            ->andReturn(null);

        $this->repository->shouldReceive('obtenerEstadoIds')
            ->andReturn([
                'activo' => 1,
                'inactivo' => 2,
                'suspendido' => 3
            ]);

        $this->repository->shouldReceive('obtenerCredencial')
            ->andReturn($credencial);

        $this->repository->shouldReceive('guardarCredencial');
        $this->repository->shouldReceive('limpiarIntentosCorreo');
        $this->repository->shouldReceive('guardarUsuario');

        $response = $this->service->login([
            'correo' => $usuario->correo,
            'password' => 'passwordCorrecta'
        ]);

        $this->assertEquals(200, $response->status());
        $this->assertArrayHasKey('redirect', $response->getData(true));
    }
    #[Test]
public function login_falla_si_cuenta_inactiva()
{
    $usuario = new Usuario();
    $usuario->id_usuario = 1;
    $usuario->correo = "test@email.com";
    $usuario->estado_id = 2;

    $credencial = new Credencial();
    $credencial->hash_contrasena = Hash::make("123456");

    $this->repository->shouldReceive('limpiarCorreosExpirados');

    $this->repository->shouldReceive('buscarUsuarioPorCorreo')
        ->andReturn($usuario);

    $this->repository->shouldReceive('obtenerIntentosCorreo')
        ->andReturn(null);

    $this->repository->shouldReceive('obtenerEstadoIds')
        ->andReturn([
            'activo' => 1,
            'inactivo' => 2,
            'suspendido' => 3
        ]);

    $this->repository->shouldReceive('obtenerCredencial')
        ->andReturn($credencial);

    $response = $this->service->login([
        'correo' => $usuario->correo,
        'password' => '123456'
    ]);

    $this->assertEquals(423, $response->status());
}
#[Test]
public function login_falla_si_cuenta_suspendida()
{
    $usuario = new Usuario();
    $usuario->id_usuario = 1;
    $usuario->correo = "test@email.com";
    $usuario->estado_id = 3;

    $registro = new \stdClass();
    $registro->fecha_ultimo_intento = now();
    $registro->intentos = 5;

    $this->repository->shouldReceive('limpiarCorreosExpirados');

    $this->repository->shouldReceive('buscarUsuarioPorCorreo')
        ->andReturn($usuario);

    $this->repository->shouldReceive('obtenerIntentosCorreo')
        ->andReturn($registro);

    $this->repository->shouldReceive('obtenerEstadoIds')
        ->andReturn([
            'activo' => 1,
            'inactivo' => 2,
            'suspendido' => 3
        ]);

    $response = $this->service->login([
        'correo' => $usuario->correo,
        'password' => '123456'
    ]);

    $this->assertEquals(423, $response->status());
}
#[Test]
public function login_correcto_con_sesion_existente()
{
    $usuario = new Usuario();
    $usuario->id_usuario = 1;
    $usuario->correo = "test@email.com";
    $usuario->estado_id = 1;

    $credencial = new Credencial();
    $credencial->hash_contrasena = Hash::make("passwordCorrecta");
    $credencial->intentos_fallidos = 0;

    $this->repository->shouldReceive('limpiarCorreosExpirados');

    $this->repository->shouldReceive('buscarUsuarioPorCorreo')
        ->andReturn($usuario);

    $this->repository->shouldReceive('obtenerIntentosCorreo')
        ->andReturn(null);

    $this->repository->shouldReceive('obtenerEstadoIds')
        ->andReturn([
            'activo' => 1,
            'inactivo' => 2,
            'suspendido' => 3
        ]);

    $this->repository->shouldReceive('obtenerCredencial')
        ->andReturn($credencial);

    $this->repository->shouldReceive('guardarCredencial');
    $this->repository->shouldReceive('limpiarIntentosCorreo');
    $this->repository->shouldReceive('guardarUsuario');

    $response = $this->service->login([
        'correo' => $usuario->correo,
        'password' => 'passwordCorrecta'
    ]);

    $this->assertEquals(200, $response->status());
}

}