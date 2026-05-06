<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\AdminRegistroService\AdminRegistroService;
use App\Repositories\AdminRegistroRepository\AdminRegistroRepository;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Http\JsonResponse; 

class AdminRegistroServiceTest extends TestCase
{
    use DatabaseTransactions;

    private $repository;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(AdminRegistroRepository::class);
        $this->service = new AdminRegistroService($this->repository);
    }

   #[Test]
public function un_admin_puede_cambiar_estado_de_usuario()
{
    $admin = Usuario::factory()->create(['id_rol' => 1]);

    $usuario = new Usuario();
    $usuario->id_usuario = 5;
    $usuario->estado_id = 1;

    $this->repository
        ->shouldReceive('obtenerUsuario')
        ->once()
        ->with(5)
        ->andReturn($usuario);

    $this->repository
        ->shouldReceive('actualizarEstado')
        ->once();

    $this->repository
        ->shouldReceive('registrarBitacora')
        ->once();

    $response = $this->service->cambiarEstado($admin, 5);

    // cambiarEstado devuelve redirect(), no JsonResponse → status 302
    $this->assertEquals(302, $response->getStatusCode());
}

    #[Test]
    public function no_puede_desactivar_su_propia_cuenta()
    {
        $admin = Usuario::factory()->create([
            'id_rol' => 1,
        ]);

        $response = $this->service->cambiarEstado($admin, $admin->id_usuario);

        $this->assertEquals(403, $response->status());
    }

    #[Test]
    public function no_puede_cambiar_estado_si_no_tiene_permiso()
    {
        $usuario = Usuario::factory()->create([
            'id_rol' => 3
        ]);

        $response = $this->service->cambiarEstado($usuario, 5);

        $this->assertEquals(403, $response->status());
    }

  #[Test]
public function puede_eliminar_usuario()
{
    $admin = Usuario::factory()->create(['id_rol' => 1]);

    $this->repository
        ->shouldReceive('eliminarUsuario')
        ->once()
        ->with(5);

    $this->repository
        ->shouldReceive('registrarBitacora')
        ->once();

    $response = $this->service->eliminarUsuario($admin, 5);

    $this->assertInstanceOf(JsonResponse::class, $response);
    $this->assertEquals(200, $response->getStatusCode());
    // ✅ el campo correcto es 'success', no 'status'
    $this->assertTrue($response->getData()->success);
}

    #[Test]
    public function no_puede_eliminar_su_propia_cuenta()
    {
        $admin = Usuario::factory()->create([
            'id_rol' => 1,
         
        ]);

        $response = $this->service->eliminarUsuario($admin, $admin->id_usuario);

        $this->assertEquals(403, $response->status());
    }
}