<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Repositories\InscripcionCursoRepositories\InscripcionCursoRepository;
use App\Models\Usuario;
use App\Models\Curso;
use App\Models\Modalidad;
use App\Models\InscripcionCurso;

class InscripcionCursoRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private InscripcionCursoRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new InscripcionCursoRepository();
    }

    private function crearModalidad(): Modalidad
    {
        return Modalidad::create(['nombre' => 'Modalidad ' . uniqid()]);
    }

    private function crearCurso(array $extra = []): Curso
    {
        return Curso::create(array_merge([
            'titulo'                   => 'Curso Test ' . uniqid(),
            'descripcion'              => 'Descripción del curso de prueba',
            'id_modalidad'             => $this->crearModalidad()->id_modalidad,
            'fecha_inicio'             => now()->addDays(5)->toDateString(),
            'fecha_fin'                => now()->addDays(30)->toDateString(),
            'fecha_limite_inscripcion' => now()->addDays(3)->toDateString(),
            'duracion'                 => '10 horas',
            'nombreInstructor'         => 'Instructor Test',
            'cupos'                    => 10,
            'estado_id'                => 1,
        ], $extra));
    }

    private function crearInscripcion(int $idCurso, int $idUsuario, int $estadoId = 1): InscripcionCurso
    {
        return InscripcionCurso::create([
            'id_curso'          => $idCurso,
            'id_usuario'        => $idUsuario,
            'fecha_inscripcion' => now(),
            'estado_id'         => $estadoId,
        ]);
    }

    #[Test]
    public function test_existe_inscripcion_retorna_true_cuando_existe()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        $this->crearInscripcion($curso->id_curso, $usuario->id_usuario);

        $resultado = $this->repository->existeInscripcion($curso->id_curso, $usuario->id_usuario);

        $this->assertTrue($resultado);
    }

    #[Test]
    public function test_existe_inscripcion_retorna_false_cuando_no_existe()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        $resultado = $this->repository->existeInscripcion($curso->id_curso, $usuario->id_usuario);

        $this->assertFalse($resultado);
    }

    #[Test]
    public function test_contar_inscritos()
    {
        $usuario1 = Usuario::factory()->create();
        $usuario2 = Usuario::factory()->create();
        $curso    = $this->crearCurso();

        $this->crearInscripcion($curso->id_curso, $usuario1->id_usuario);
        $this->crearInscripcion($curso->id_curso, $usuario2->id_usuario);

        $total = $this->repository->contarInscritos($curso->id_curso);

        $this->assertEquals(2, $total);
    }

    #[Test]
    public function test_obtener_curso_con_modalidad()
    {
        $curso = $this->crearCurso();

        $resultado = $this->repository->obtenerCursoConModalidad($curso->id_curso);

        $this->assertInstanceOf(Curso::class, $resultado);
        $this->assertEquals($curso->id_curso, $resultado->id_curso);
        $this->assertNotNull($resultado->modalidad);
    }

    #[Test]
    public function test_obtener_curso_con_modalidad_inexistente_retorna_null()
    {
        $resultado = $this->repository->obtenerCursoConModalidad(999999);

        $this->assertNull($resultado);
    }

    #[Test]
    public function test_inscribir_crea_nueva_inscripcion()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        $inscripcion = $this->repository->inscribir($curso->id_curso, $usuario->id_usuario);

        $this->assertInstanceOf(InscripcionCurso::class, $inscripcion);
        $this->assertDatabaseHas('inscripciones_curso', [
            'id_curso'   => $curso->id_curso,
            'id_usuario' => $usuario->id_usuario,
            'estado_id'  => 1,
        ]);
    }

    #[Test]
    public function test_inscribir_reactiva_inscripcion_existente()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        // Crear inscripción cancelada (estado != 1)
        InscripcionCurso::create([
            'id_curso'          => $curso->id_curso,
            'id_usuario'        => $usuario->id_usuario,
            'fecha_inscripcion' => now()->subDays(5),
            'estado_id'         => 2,
        ]);

        $inscripcion = $this->repository->inscribir($curso->id_curso, $usuario->id_usuario);

        $this->assertEquals(1, $inscripcion->estado_id);
        $this->assertDatabaseHas('inscripciones_curso', [
            'id_curso'   => $curso->id_curso,
            'id_usuario' => $usuario->id_usuario,
            'estado_id'  => 1,
        ]);
    }

    #[Test]
    public function test_cancelar_inscripcion()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        $this->crearInscripcion($curso->id_curso, $usuario->id_usuario);

        $resultado = $this->repository->cancelarInscripcion($curso->id_curso, $usuario->id_usuario);

        $this->assertTrue($resultado);
        $this->assertDatabaseMissing('inscripciones_curso', [
            'id_curso'   => $curso->id_curso,
            'id_usuario' => $usuario->id_usuario,
        ]);
    }

    #[Test]
    public function test_obtener_cursos_por_usuario()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        $this->crearInscripcion($curso->id_curso, $usuario->id_usuario);

        $resultado = $this->repository->obtenerCursosPorUsuario($usuario->id_usuario);

        $this->assertNotEmpty($resultado);
        $this->assertEquals($curso->id_curso, $resultado->first()['id_curso']);
    }

    #[Test]
    public function test_obtener_conteo_inscritos_por_curso()
    {
        $usuario = Usuario::factory()->create();
        $curso   = $this->crearCurso();

        $this->crearInscripcion($curso->id_curso, $usuario->id_usuario);

        $resultado = $this->repository->obtenerConteoInscritosPorCurso();

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey($curso->id_curso, $resultado);
        $this->assertEquals(1, $resultado[$curso->id_curso]);
    }
}