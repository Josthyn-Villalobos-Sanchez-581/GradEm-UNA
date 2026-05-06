<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\InscripcionCursoServices\InscripcionCursoService;
use App\Repositories\InscripcionCursoRepositories\InscripcionCursoRepository;
use App\Models\Curso;
use App\Models\InscripcionCurso;
use Illuminate\Support\Facades\Mail;

class InscripcionCursoServiceTest extends TestCase
{
    private $repoMock;
    private InscripcionCursoService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repoMock = $this->mock(InscripcionCursoRepository::class);
        $this->service  = new InscripcionCursoService($this->repoMock);
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
        $curso->estado_id                 = 1;
        $curso->cupos                     = null;
        $curso->fecha_limite_inscripcion  = now()->addDays(5)->toDateString();

        foreach ($extra as $key => $value) {
            $curso->$key = $value;
        }

        return $curso;
    }

    #[Test]
    public function test_inscribir_exitosamente()
    {
        Mail::fake();

        $curso = $this->crearCursoFalso();

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);
        $this->repoMock->shouldReceive('existeInscripcion')->once()->with(1, 10)->andReturn(false);
        $this->repoMock->shouldReceive('inscribir')->once()->with(1, 10)->andReturn(new InscripcionCurso());

        $excepcion = null;
        try {
            $this->service->inscribir(1, 10);
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_inscribir_lanza_excepcion_si_curso_no_existe()
    {
        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(99)->andReturn(null);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('El curso solicitado no existe.');

        $this->service->inscribir(99, 10);
    }

    #[Test]
    public function test_inscribir_lanza_excepcion_si_curso_no_publicado()
    {
        $curso = $this->crearCursoFalso(['estado_id' => 7]);

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Este curso no está disponible para inscripciones.');

        $this->service->inscribir(1, 10);
    }

    #[Test]
    public function test_inscribir_lanza_excepcion_si_fecha_limite_vencida()
    {
        $curso = $this->crearCursoFalso([
            'fecha_limite_inscripcion' => now()->subDays(1)->toDateString(),
        ]);

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('El plazo de inscripción para este curso ha vencido.');

        $this->service->inscribir(1, 10);
    }

    #[Test]
    public function test_inscribir_lanza_excepcion_si_ya_inscrito()
    {
        $curso = $this->crearCursoFalso();

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);
        $this->repoMock->shouldReceive('existeInscripcion')->once()->with(1, 10)->andReturn(true);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('Ya se encuentra inscrito/a en este curso.');

        $this->service->inscribir(1, 10);
    }

    #[Test]
    public function test_inscribir_lanza_excepcion_si_sin_cupos()
    {
        $curso = $this->crearCursoFalso(['cupos' => 2]);

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);
        $this->repoMock->shouldReceive('existeInscripcion')->once()->with(1, 10)->andReturn(false);
        $this->repoMock->shouldReceive('contarInscritos')->once()->with(1)->andReturn(2);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('No hay cupos disponibles en este curso.');

        $this->service->inscribir(1, 10);
    }

    #[Test]
    public function test_esta_inscrito_retorna_true()
    {
        $this->repoMock->shouldReceive('existeInscripcion')->once()->with(1, 10)->andReturn(true);

        $this->assertTrue($this->service->estaInscrito(1, 10));
    }

    #[Test]
    public function test_cupos_disponibles_retorna_null_si_sin_cupos_definidos()
    {
        $curso = $this->crearCursoFalso(['cupos' => null]);

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);

        $resultado = $this->service->cuposDisponibles(1);

        $this->assertNull($resultado);
    }

    #[Test]
    public function test_cupos_disponibles_retorna_cantidad_correcta()
    {
        $curso = $this->crearCursoFalso(['cupos' => 10]);

        $this->repoMock->shouldReceive('obtenerCursoConModalidad')->once()->with(1)->andReturn($curso);
        $this->repoMock->shouldReceive('contarInscritos')->once()->with(1)->andReturn(3);

        $resultado = $this->service->cuposDisponibles(1);

        $this->assertEquals(7, $resultado);
    }

    #[Test]
    public function test_cancelar_exitosamente()
    {
        $this->repoMock->shouldReceive('existeInscripcion')->once()->with(1, 10)->andReturn(true);
        $this->repoMock->shouldReceive('cancelarInscripcion')->once()->with(1, 10)->andReturn(true);

        $excepcion = null;
        try {
            $this->service->cancelar(1, 10);
        } catch (\Exception $e) {
            $excepcion = $e;
        }

        $this->assertNull($excepcion);
    }

    #[Test]
    public function test_cancelar_lanza_excepcion_si_no_inscrito()
    {
        $this->repoMock->shouldReceive('existeInscripcion')->once()->with(1, 10)->andReturn(false);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessage('No está inscrito en este curso.');

        $this->service->cancelar(1, 10);
    }
}