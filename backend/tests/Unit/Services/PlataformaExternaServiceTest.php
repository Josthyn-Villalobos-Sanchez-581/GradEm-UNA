<?php
//backend/tests/Unit/Services/PlataformaExternaServiceTest.php
use App\Services\PlataformaExternaService\PlataformaExternaService;

use Tests\TestCase;
use Mockery\MockInterface;
use Mockery;
use App\Repositories\PlataformaExternaRepository\PlataformaExternaRepository;
use App\Models\Usuario;
use App\Models\Rol;
use App\Models\PlataformaExterna;
use Illuminate\Http\JsonResponse;

class PlataformaExternaServiceTest extends TestCase
{
    private $repositoryMock;
    private PlataformaExternaService $service;

  protected function setUp(): void
{
    parent::setUp();

    $this->repositoryMock = $this->mock(PlataformaExternaRepository::class);

    $this->service = new PlataformaExternaService($this->repositoryMock);
}

protected function tearDown(): void
{
    Mockery::close();
    parent::tearDown();
}

    public function test_agregar_plataforma_correctamente()
    {
        $usuario = new Usuario();
        $usuario->id_usuario = 1;
        $usuario->estado_estudios = 'activo';

        $rol = new Rol();
        $rol->nombre_rol = 'estudiante';
        $usuario->setRelation('rol', $rol);

        $datos = [
            'tipo' => 'linkedin',
            'url' => 'https://linkedin.com/test'
        ];

        $this->repositoryMock
            ->shouldReceive('crear')
            ->once();

        $this->repositoryMock
            ->shouldReceive('obtenerPorUsuario')
            ->once()
            ->andReturn([]);

        $respuesta = $this->service->agregarPlataforma($usuario, $datos);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(201, $respuesta->status());
    }

    public function test_eliminar_plataforma_correctamente()
    {
        $usuario = new Usuario();
        $usuario->id_usuario = 1;

        $plataforma = new PlataformaExterna();
        $plataforma->id_usuario = 1;

        $this->repositoryMock
            ->shouldReceive('obtenerPorId')
            ->once()
            ->andReturn($plataforma);

        $this->repositoryMock
            ->shouldReceive('eliminar')
            ->once();

        $this->repositoryMock
            ->shouldReceive('obtenerPorUsuario')
            ->once()
            ->andReturn([]);

        $respuesta = $this->service->eliminarPlataforma($usuario, 1);

        $this->assertInstanceOf(JsonResponse::class, $respuesta);
        $this->assertEquals(200, $respuesta->status());
    }
public function test_no_puede_eliminar_plataforma_de_otro_usuario()
{
    $usuario = new Usuario();
    $usuario->id_usuario = 1;

    $plataforma = new PlataformaExterna();
    $plataforma->id_usuario = 2;

    $this->repositoryMock
        ->shouldReceive('obtenerPorId')
        ->once()
        ->andReturn($plataforma);

    $respuesta = $this->service->eliminarPlataforma($usuario, 1);

    $this->assertInstanceOf(JsonResponse::class, $respuesta);
    $this->assertEquals(403, $respuesta->status());
}
public function test_usuario_sin_permiso_no_puede_agregar_plataforma()
{
    $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

    $usuario = new Usuario();
    $usuario->id_usuario = 1;
    $usuario->estado_estudios = 'rechazado';

    $rol = new Rol();
    $rol->nombre_rol = 'visitante';

    $usuario->setRelation('rol', $rol);

    $datos = [
        'tipo' => 'github',
        'url' => 'https://github.com/test'
    ];

    $this->service->agregarPlataforma($usuario, $datos);
}

}