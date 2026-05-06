<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\CursoServices\CursoService;
use App\Repositories\CursoRepositories\CursoRepository;
use App\Exceptions\CursoNoEncontradoException;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CursoServiceTest extends TestCase
{
    private $repositoryMock;
    private CursoService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositoryMock = $this->mock(CursoRepository::class);
        $this->service = new CursoService($this->repositoryMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function crearCursoFalso(array $extra = []): Curso
    {
        $curso = new Curso();
        $curso->id_curso                  = 1;
        $curso->titulo                    = 'Curso de prueba';
        $curso->descripcion               = 'Descripción del curso';
        $curso->id_modalidad              = 1;
        $curso->fecha_inicio              = now()->addDays(5)->toDateString();
        $curso->fecha_limite_inscripcion  = now()->addDays(3)->toDateString();
        $curso->nombreInstructor          = 'Instructor Test';
        $curso->estado_id                 = 2;

        foreach ($extra as $key => $value) {
            $curso->$key = $value;
        }

        return $curso;
    }

    #[Test]
    public function test_obtener_curso_por_id()
    {
        $curso = $this->crearCursoFalso();

        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(1)
            ->andReturn($curso);

        $resultado = $this->service->obtenerCursoPorId(1);

        $this->assertInstanceOf(Curso::class, $resultado);
        $this->assertEquals(1, $resultado->id_curso);
    }

    #[Test]
    public function test_registrar_curso()
    {
        Mail::fake();

        $curso = $this->crearCursoFalso();
        $curso->load = fn() => $curso;

        $this->repositoryMock
            ->shouldReceive('crearCurso')
            ->once()
            ->andReturn($curso);

        $request = Request::create('/cursos', 'POST', [
            'titulo'                   => 'Curso de prueba',
            'descripcion'              => 'Descripción del curso',
            'id_modalidad'             => 1,
            'fecha_inicio'             => now()->addDays(5)->toDateString(),
            'fecha_fin'                => now()->addDays(30)->toDateString(),
            'fecha_limite_inscripcion' => now()->addDays(3)->toDateString(),
            'duracion'                 => '10 horas',
            'nombreInstructor'         => 'Instructor Test',
            'cupos'                    => 20,
        ]);

        $resultado = $this->service->registrarCurso($request);

        $this->assertInstanceOf(Curso::class, $resultado);
    }

    #[Test]
    public function test_publicar_curso_exitosamente()
    {
        $curso = $this->crearCursoFalso([
            'titulo'                   => 'Curso completo',
            'descripcion'              => 'Descripción completa del curso',
            'id_modalidad'             => 1,
            'fecha_inicio'             => now()->addDays(5)->toDateString(),
            'fecha_limite_inscripcion' => now()->addDays(3)->toDateString(),
            'nombreInstructor'         => 'Instructor Test',
            'estado_id'                => 2,
        ]);

        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(1)
            ->andReturn($curso);

        $this->repositoryMock
            ->shouldReceive('publicarCurso')
            ->once()
            ->with($curso);

        $excepcion = null;
        try {
            $this->service->publicarCurso(1);
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_publicar_curso_ya_publicado_lanza_excepcion()
    {
        $curso = $this->crearCursoFalso(['estado_id' => 1]);

        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(1)
            ->andReturn($curso);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El curso ya se encuentra publicado.');

        $this->service->publicarCurso(1);
    }

    #[Test]
    public function test_publicar_curso_sin_campos_lanza_domain_exception()
    {
        $curso = $this->crearCursoFalso([
            'titulo'                   => null,
            'descripcion'              => null,
            'id_modalidad'             => null,
            'fecha_inicio'             => null,
            'fecha_limite_inscripcion' => null,
            'nombreInstructor'         => null,
            'estado_id'                => 2,
        ]);

        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(1)
            ->andReturn($curso);

        $this->expectException(\DomainException::class);

        $this->service->publicarCurso(1);
    }

    #[Test]
    public function test_eliminar_curso_inexistente_lanza_excepcion()
    {
        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(999)
            ->andReturn(null);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Curso no encontrado.');

        $this->service->eliminarCurso(999, 'motivo');
    }

    #[Test]
    public function test_eliminar_curso_sin_inscritos()
    {
        Mail::fake();

        $curso = $this->crearCursoFalso();

        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(1)
            ->andReturn($curso);

        $this->repositoryMock
            ->shouldReceive('obtenerInscritosCurso')
            ->once()
            ->with(1)
            ->andReturn(collect([]));

        $this->repositoryMock
            ->shouldReceive('eliminarCurso')
            ->once()
            ->with($curso);

        $excepcion = null;
        try {
            $this->service->eliminarCurso(1, 'Motivo de prueba');
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_generar_pdf_inscritos_lanza_excepcion_si_curso_no_existe()
    {
        $this->repositoryMock
            ->shouldReceive('obtenerCursoPorId')
            ->once()
            ->with(999)
            ->andReturn(null);

        $this->expectException(CursoNoEncontradoException::class);

        $this->service->generarPdfInscritosCurso(999);
    }
}