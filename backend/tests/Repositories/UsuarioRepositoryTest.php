<?php

namespace tests\Repositories\UsuarioRepository;

use Tests\TestCase;
use App\Models\Usuario;
use App\Repositories\UsuarioRepositories\UsuarioRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test; 
class UsuarioRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    protected UsuarioRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new UsuarioRepository();
    }

   #[Test]
   public function puede_obtener_todos_los_usuarios()
{
    $inicial = Usuario::count();

    Usuario::factory()->count(3)->create();

    $usuarios = $this->repository->obtenerTodos();

    $this->assertCount($inicial + 3, $usuarios);
}

    #[Test]
    public function puede_crear_un_usuario()
    {
        $datos = Usuario::factory()->make()->toArray();

        $usuario = $this->repository->crearUsuario($datos);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario
        ]);
    }

    #[Test]
    public function puede_actualizar_un_usuario()
    {
        $usuario = Usuario::factory()->create();

        $this->repository->actualizarUsuario($usuario, [
            'nombre_completo' => 'Nuevo Nombre'
        ]);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario,
            'nombre_completo' => 'Nuevo Nombre'
        ]);
    }

    #[Test]
    public function puede_eliminar_un_usuario()
    {
        $usuario = Usuario::factory()->create();

        $this->repository->eliminarUsuario($usuario);

        $this->assertDatabaseMissing('usuarios', [
            'id_usuario' => $usuario->id_usuario
        ]);
    }

    #[Test]
    public function puede_obtener_usuario_con_relaciones()
    {
        $usuario = Usuario::factory()->create();

        $resultado = $this->repository->obtenerPorModelo($usuario);

        $this->assertInstanceOf(Usuario::class, $resultado);
    }
}