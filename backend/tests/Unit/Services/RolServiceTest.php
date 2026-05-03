<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\RolServices\RolService;
use App\Repositories\RolRepositories\RolRepository;
use App\Models\Rol;
use App\Models\Usuario;

class RolServiceTest extends TestCase
{
    private $repositoryMock;
    private RolService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositoryMock = $this->mock(RolRepository::class);
        $this->service        = new RolService($this->repositoryMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function crearUsuarioFalso(int $idRol = 1): object
    {
        $usuario          = new \stdClass();
        $usuario->id_rol  = $idRol;
        return $usuario;
    }

    private function crearRolFalso(int $id = 1, string $nombre = 'Rol Test'): Rol
    {
        $rol             = new Rol();
        $rol->id_rol     = $id;
        $rol->nombre_rol = $nombre;
        $rol->setRelation('permisos', collect([]));
        return $rol;
    }

    #[Test]
    public function test_obtener_datos_index()
    {
        $usuario = $this->crearUsuarioFalso();

        $this->repositoryMock->shouldReceive('obtenerRolesPaginados')->once()->with(null)->andReturn(collect([]));
        $this->repositoryMock->shouldReceive('obtenerPermisosPaginados')->once()->with(null)->andReturn(collect([]));
        $this->repositoryMock->shouldReceive('obtenerTodosPermisos')->once()->andReturn(collect([]));
        $this->repositoryMock->shouldReceive('obtenerPermisosPorRolUsuario')->once()->with(1)->andReturn([]);

        $resultado = $this->service->obtenerDatosIndex(null, null, ['roles'], $usuario);

        $this->assertArrayHasKey('roles', $resultado);
        $this->assertArrayHasKey('permisos', $resultado);
        $this->assertArrayHasKey('userPermisos', $resultado);
        $this->assertArrayHasKey('visibleSections', $resultado);
    }

    #[Test]
    public function test_obtener_datos_create()
    {
        $usuario = $this->crearUsuarioFalso();

        $this->repositoryMock->shouldReceive('obtenerTodosPermisos')->once()->andReturn(collect([]));
        $this->repositoryMock->shouldReceive('obtenerPermisosPorRolUsuario')->once()->with(1)->andReturn([]);

        $resultado = $this->service->obtenerDatosCreate($usuario);

        $this->assertArrayHasKey('todosPermisos', $resultado);
        $this->assertArrayHasKey('userPermisos', $resultado);
    }

    #[Test]
    public function test_obtener_datos_edit()
    {
        $usuario = $this->crearUsuarioFalso();
        $rol     = $this->crearRolFalso();

        $this->repositoryMock->shouldReceive('obtenerRolConPermisos')->once()->with(1)->andReturn($rol);
        $this->repositoryMock->shouldReceive('obtenerTodosPermisos')->once()->andReturn(collect([]));
        $this->repositoryMock->shouldReceive('obtenerPermisosPorRolUsuario')->once()->with(1)->andReturn([]);

        $resultado = $this->service->obtenerDatosEdit(1, $usuario);

        $this->assertArrayHasKey('rol', $resultado);
        $this->assertArrayHasKey('todosPermisos', $resultado);
        $this->assertArrayHasKey('userPermisos', $resultado);
    }

    #[Test]
    public function test_crear_rol()
    {
        $usuario = Usuario::factory()->create();
        $this->actingAs($usuario, 'sanctum');

        $rol = $this->crearRolFalso(99, 'Nuevo Rol');

        $this->repositoryMock->shouldReceive('crearRol')->once()->with('Nuevo Rol')->andReturn($rol);
        $this->repositoryMock->shouldReceive('registrarBitacora')->once();

        $excepcion = null;
        try {
            $this->service->crearRol('Nuevo Rol');
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_actualizar_rol()
    {
        $usuario = Usuario::factory()->create();
        $this->actingAs($usuario, 'sanctum');

        $rol = $this->crearRolFalso();

        $this->repositoryMock->shouldReceive('buscarRolPorId')->once()->with(1)->andReturn($rol);
        $this->repositoryMock->shouldReceive('actualizarRol')->once()->with($rol, 'Nombre Actualizado');
        $this->repositoryMock->shouldReceive('registrarBitacora')->once();

        $excepcion = null;
        try {
            $this->service->actualizarRol(1, 'Nombre Actualizado');
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_eliminar_rol_sin_permisos()
    {
        $usuario = Usuario::factory()->create();
        $this->actingAs($usuario, 'sanctum');

        $rol = $this->crearRolFalso();

        $this->repositoryMock->shouldReceive('obtenerRolConPermisos')->once()->with(1)->andReturn($rol);
        $this->repositoryMock->shouldReceive('desasignarPermisosRol')->once()->with($rol)->andReturn([]);
        $this->repositoryMock->shouldReceive('eliminarRol')->once()->with($rol);
        $this->repositoryMock->shouldReceive('registrarBitacora')->once();

        $excepcion = null;
        try {
            $this->service->eliminarRol(1);
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_eliminar_rol_con_permisos_registra_dos_bitacoras()
    {
        $usuario = Usuario::factory()->create();
        $this->actingAs($usuario, 'sanctum');

        $rol = $this->crearRolFalso();

        $this->repositoryMock->shouldReceive('obtenerRolConPermisos')->once()->with(1)->andReturn($rol);
        $this->repositoryMock->shouldReceive('desasignarPermisosRol')->once()->with($rol)->andReturn([5, 8]);
        $this->repositoryMock->shouldReceive('eliminarRol')->once()->with($rol);
        // Con permisos → 2 bitácoras (desasignar + eliminar)
        $this->repositoryMock->shouldReceive('registrarBitacora')->twice();

        $excepcion = null;
        try {
            $this->service->eliminarRol(1);
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }
}