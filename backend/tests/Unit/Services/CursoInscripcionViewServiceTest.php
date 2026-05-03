<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\CursoServices\CursoInscripcionViewService;
use App\Repositories\CursoRepositories\CursoRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CursoInscripcionViewServiceTest extends TestCase
{
    private $repositoryMock;
    private CursoInscripcionViewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositoryMock = $this->mock(CursoRepository::class);
        $this->service = new CursoInscripcionViewService($this->repositoryMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function test_obtener_cursos_para_inscripcion()
    {
        $usuario = new \stdClass();
        $usuario->id_rol = 3;

        $request = Request::create('/cursos/inscripcion', 'GET', []);

        $this->repositoryMock
            ->shouldReceive('filtrarCursos')
            ->once()
            ->with($request, $usuario)
            ->andReturn(collect([]));

        $resultado = $this->service->obtenerCursosParaInscripcion($request, $usuario);

        $this->assertNotNull($resultado);
    }

    #[Test]
    public function test_obtener_modalidades()
    {
        $this->repositoryMock
            ->shouldReceive('obtenerModalidades')
            ->once()
            ->andReturn(collect([]));

        $resultado = $this->service->obtenerModalidades();

        $this->assertNotNull($resultado);
    }

    #[Test]
    public function test_obtener_mis_inscripciones_retorna_array()
    {
        // Este método usa DB directamente, necesitamos
        // que haya un usuario válido en la BD
        DB::table('inscripciones_curso')
            ->where('id_usuario', 999999)
            ->delete();

        $resultado = $this->service->obtenerMisInscripciones(999999);

        $this->assertIsArray($resultado);
        $this->assertEmpty($resultado);
    }

    #[Test]
    public function test_obtener_inscritos_count_retorna_array()
    {
        $resultado = $this->service->obtenerInscritosCount();

        $this->assertIsArray($resultado);
    }
}