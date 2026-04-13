<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Services\UsuarioServices\UsuarioService;
use App\Repositories\UsuarioRepositories\UsuarioRepository;
use PHPUnit\Framework\Attributes\Test; 
class UsuarioServiceTest extends TestCase
{
    protected $repository;
    protected UsuarioService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(UsuarioRepository::class);
        $this->service = new UsuarioService($this->repository);
    }

   #[Test]
    public function puede_obtener_todos_los_usuarios()
    {
        $usuariosFake = collect([
            new Usuario(),
            new Usuario(),
            new Usuario()
        ]);

        $this->repository
            ->shouldReceive('obtenerTodos')
            ->once()
            ->andReturn($usuariosFake);

        $usuarios = $this->service->obtenerListadoUsuarios();

        $this->assertCount(3, $usuarios);
    }

    #[Test]
    public function puede_registrar_un_usuario()
    {
        $request = new Request([
            'nombre_completo' => 'Usuario Test'
        ]);

        $usuarioFake = new Usuario();

        $this->repository
            ->shouldReceive('crearUsuario')
            ->once()
            ->with($request->all())
            ->andReturn($usuarioFake);

        $usuario = $this->service->registrarUsuario($request);

        $this->assertInstanceOf(Usuario::class, $usuario);
    }

    #[Test]
    public function puede_actualizar_un_usuario()
    {
        $usuario = new Usuario();

        $request = new Request([
            'nombre_completo' => 'Actualizado'
        ]);

        $this->repository
            ->shouldReceive('actualizarUsuario')
            ->once()
            ->with($usuario, $request->all())
            ->andReturn($usuario);

        $resultado = $this->service->actualizarUsuario($request, $usuario);

        $this->assertInstanceOf(Usuario::class, $resultado);
    }

    #[Test]
    public function puede_eliminar_un_usuario()
    {
        $usuario = new Usuario();

        $this->repository
            ->shouldReceive('eliminarUsuario')
            ->once()
            ->with($usuario)
            ->andReturn(true);

        $resultado = $this->service->eliminarUsuario($usuario);

        $this->assertTrue($resultado);
    }
}