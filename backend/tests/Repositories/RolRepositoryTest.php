<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Repositories\RolRepositories\RolRepository;
use App\Models\Rol;
use App\Models\Usuario;

class RolRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private RolRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new RolRepository();
    }

    private function crearRol(string $nombre = null): Rol
    {
        return Rol::create([
            'nombre_rol' => $nombre ?? 'Rol Test ' . uniqid(),
        ]);
    }

    #[Test]
    public function test_obtener_roles_paginados_sin_filtro()
    {
        $rol = $this->crearRol();

        $resultado = $this->repository->obtenerRolesPaginados(null);

        $this->assertNotNull($resultado);
        $this->assertTrue($resultado->contains('id_rol', $rol->id_rol));
    }

    #[Test]
    public function test_obtener_roles_paginados_con_filtro()
    {
        $nombre = 'RolUnico' . uniqid();
        $rol = $this->crearRol($nombre);

        $resultado = $this->repository->obtenerRolesPaginados($nombre);

        $this->assertTrue($resultado->contains('id_rol', $rol->id_rol));
    }

    #[Test]
    public function test_obtener_permisos_paginados_sin_filtro()
    {
        $resultado = $this->repository->obtenerPermisosPaginados(null);

        $this->assertNotNull($resultado);
    }

    #[Test]
    public function test_obtener_todos_los_permisos()
    {
        $resultado = $this->repository->obtenerTodosPermisos();

        $this->assertNotNull($resultado);
        $this->assertIsIterable($resultado);
    }

    #[Test]
    public function test_obtener_permisos_por_rol_usuario()
    {
        $resultado = $this->repository->obtenerPermisosPorRolUsuario(1);

        $this->assertIsArray($resultado);
    }

    #[Test]
    public function test_obtener_permisos_por_rol_inexistente_retorna_vacio()
    {
        $resultado = $this->repository->obtenerPermisosPorRolUsuario(999999);

        $this->assertIsArray($resultado);
        $this->assertEmpty($resultado);
    }

    #[Test]
    public function test_crear_rol()
    {
        $nombre = 'Rol Nuevo ' . uniqid();

        $rol = $this->repository->crearRol($nombre);

        $this->assertInstanceOf(Rol::class, $rol);
        $this->assertDatabaseHas('roles', [
            'id_rol'     => $rol->id_rol,
            'nombre_rol' => $nombre,
        ]);
    }

    #[Test]
    public function test_buscar_rol_por_id()
    {
        $rol = $this->crearRol();

        $resultado = $this->repository->buscarRolPorId($rol->id_rol);

        $this->assertInstanceOf(Rol::class, $resultado);
        $this->assertEquals($rol->id_rol, $resultado->id_rol);
    }

    #[Test]
    public function test_buscar_rol_por_id_inexistente_lanza_excepcion()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->repository->buscarRolPorId(999999);
    }

    #[Test]
    public function test_obtener_rol_con_permisos()
    {
        $rol = $this->crearRol();

        $resultado = $this->repository->obtenerRolConPermisos($rol->id_rol);

        $this->assertInstanceOf(Rol::class, $resultado);
        $this->assertTrue($resultado->relationLoaded('permisos'));
    }

    #[Test]
    public function test_actualizar_rol()
    {
        $rol = $this->crearRol();
        $nuevoNombre = 'Rol Actualizado ' . uniqid();

        $this->repository->actualizarRol($rol, $nuevoNombre);

        $this->assertDatabaseHas('roles', [
            'id_rol'     => $rol->id_rol,
            'nombre_rol' => $nuevoNombre,
        ]);
    }

    #[Test]
    public function test_eliminar_rol()
    {
        $rol = $this->crearRol();
        $id  = $rol->id_rol;

        $this->repository->eliminarRol($rol);

        $this->assertDatabaseMissing('roles', ['id_rol' => $id]);
    }

    #[Test]
    public function test_registrar_bitacora()
    {
        $usuario = Usuario::factory()->create();

        $excepcion = null;
        try {
            $this->repository->registrarBitacora(
                tabla: 'roles',
                operacion: 'crear',
                descripcion: 'Test bitácora',
                usuarioId: $usuario->id_usuario
            );
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
        $this->assertDatabaseHas('bitacora_cambios', [
            'tabla_afectada'      => 'roles',
            'operacion'           => 'crear',
            'usuario_responsable' => $usuario->id_usuario,
        ]);
    }
}