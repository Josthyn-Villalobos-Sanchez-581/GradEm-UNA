<?php
namespace App\Repositories\AdminRegistroRepository;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Rol;
use App\Repositories\AdminRegistroRepository\AdminRegistroRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;

class AdminRegistroRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    protected AdminRegistroRepository $repo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repo = new AdminRegistroRepository();
    }

    public function test_puede_obtener_usuario()
    {
        $usuario = Usuario::factory()->create();

        $resultado = $this->repo->obtenerUsuario($usuario->id_usuario);

        $this->assertEquals($usuario->id_usuario, $resultado->id_usuario);
    }

    public function test_puede_crear_usuario_completo()
    {
        $rol = Rol::factory()->create([
            'nombre_rol' => 'Administrador del Sistema'
        ]);

        $data = [
            'nombre_completo' => 'Usuario Test',
            'correo' => 'test@repo.com',
            'identificacion' => '12345678',
            'telefono' => '88888888',
            'rol' => 'Administrador del Sistema',
            'contrasena' => 'Password123!'
        ];

        $usuarioId = $this->repo->crearUsuarioCompleto($data);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuarioId,
            'correo' => 'test@repo.com'
        ]);

        $this->assertDatabaseHas('credenciales', [
            'id_usuario' => $usuarioId
        ]);
    }

    public function test_puede_actualizar_usuario()
    {
        $rol = Rol::factory()->create([
            'nombre_rol' => 'Administrador del Sistema'
        ]);

        $usuario = Usuario::factory()->create([
            'id_rol' => $rol->id_rol
        ]);

        DB::table('credenciales')->insert([
            'id_usuario' => $usuario->id_usuario,
            'hash_contrasena' => bcrypt('123456')
        ]);

        $data = [
            'nombre_completo' => 'Usuario Actualizado',
            'correo' => 'nuevo@repo.com',
            'identificacion' => '999999',
            'telefono' => '77777777',
            'rol' => 'Administrador del Sistema',
            'contrasena' => 'NuevaPassword'
        ];

        $this->repo->actualizarUsuarioCompleto($usuario->id_usuario, $data);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario,
            'nombre_completo' => 'Usuario Actualizado'
        ]);
    }

    public function test_puede_eliminar_usuario()
    {
        $usuario = Usuario::factory()->create();

        DB::table('credenciales')->insert([
            'id_usuario' => $usuario->id_usuario,
            'hash_contrasena' => bcrypt('123456')
        ]);

        $this->repo->eliminarUsuario($usuario->id_usuario);

        $this->assertDatabaseMissing('usuarios', [
            'id_usuario' => $usuario->id_usuario
        ]);

        $this->assertDatabaseMissing('credenciales', [
            'id_usuario' => $usuario->id_usuario
        ]);
    }

    public function test_puede_actualizar_estado_usuario()
    {
        $usuario = Usuario::factory()->create();

        $this->repo->actualizarEstado($usuario->id_usuario, 2);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario,
            'estado_id' => 2
        ]);
    }

    public function test_puede_obtener_permisos()
    {
        $rol = Rol::factory()->create();

        DB::table('roles_permisos')->insert([
            'id_rol' => $rol->id_rol,
            'id_permiso' => 1
        ]);

        $permisos = $this->repo->obtenerPermisos($rol->id_rol);

        $this->assertContains(1, $permisos);
    }
}