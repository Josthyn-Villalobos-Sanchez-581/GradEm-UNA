<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Repositories\CursoRepositories\CursoRepository;
use App\Models\Usuario;
use App\Models\Curso;
use App\Models\Modalidad;
use Illuminate\Http\Request;

class CursoRepositoryTest extends TestCase
{
    use DatabaseTransactions;

    private CursoRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new CursoRepository();
    }

    private function crearModalidad(): Modalidad
    {
        return Modalidad::create(['nombre' => 'Modalidad ' . uniqid()]);
    }

    private function crearCurso(array $extra = []): Curso
    {
        $modalidad = $this->crearModalidad();

        return Curso::create(array_merge([
            'titulo'                    => 'Curso Test ' . uniqid(),
            'descripcion'               => 'Descripción del curso de prueba',
            'id_modalidad'              => $modalidad->id_modalidad,
            'fecha_inicio'              => now()->addDays(5)->toDateString(),
            'fecha_fin'                 => now()->addDays(30)->toDateString(),
            'fecha_limite_inscripcion'  => now()->addDays(3)->toDateString(),
            'duracion'                  => '20 horas',
            'nombreInstructor'          => 'Instructor Test',
            'cupos'                     => 20,
            'estado_id'                 => 7,
        ], $extra));
    }

    #[Test]
    public function test_obtener_modalidades()
    {
        $modalidad = $this->crearModalidad();

        $resultado = $this->repository->obtenerModalidades();

        $this->assertNotEmpty($resultado);
        $this->assertTrue($resultado->contains('id_modalidad', $modalidad->id_modalidad));
    }

    #[Test]
    public function test_crear_curso()
    {
        $modalidad = $this->crearModalidad();

        $data = [
            'titulo'                   => 'Nuevo Curso ' . uniqid(),
            'descripcion'              => 'Descripción válida del curso',
            'id_modalidad'             => $modalidad->id_modalidad,
            'fecha_inicio'             => now()->addDays(5)->toDateString(),
            'fecha_fin'                => now()->addDays(30)->toDateString(),
            'fecha_limite_inscripcion' => now()->addDays(3)->toDateString(),
            'duracion'                 => '10 horas',
            'nombreInstructor'         => 'Instructor Test',
            'cupos'                    => 15,
            'estado_id'                => 7,
        ];

        $curso = $this->repository->crearCurso($data);

        $this->assertInstanceOf(Curso::class, $curso);
        $this->assertDatabaseHas('cursos', [
            'id_curso'    => $curso->id_curso,
            'titulo'      => $data['titulo'],
            'estado_id'   => 7,
        ]);
    }

    #[Test]
    public function test_obtener_curso_por_id()
    {
        $curso = $this->crearCurso();

        $resultado = $this->repository->obtenerCursoPorId($curso->id_curso);

        $this->assertInstanceOf(Curso::class, $resultado);
        $this->assertEquals($curso->id_curso, $resultado->id_curso);
    }

    #[Test]
    public function test_obtener_curso_por_id_inexistente_retorna_null()
    {
        $resultado = $this->repository->obtenerCursoPorId(999999);

        $this->assertNull($resultado);
    }

    #[Test]
    public function test_publicar_curso()
    {
        $curso = $this->crearCurso(['estado_id' => 7]);

        $this->repository->publicarCurso($curso);

        $this->assertDatabaseHas('cursos', [
            'id_curso'  => $curso->id_curso,
            'estado_id' => 1,
        ]);
    }

    #[Test]
    public function test_actualizar_curso()
    {
        $curso = $this->crearCurso();

        $this->repository->actualizarCurso($curso, [
            'titulo'          => 'Título Actualizado',
            'nombreInstructor' => 'Nuevo Instructor',
        ]);

        $this->assertDatabaseHas('cursos', [
            'id_curso'         => $curso->id_curso,
            'titulo'           => 'Título Actualizado',
            'nombreInstructor' => 'Nuevo Instructor',
        ]);
    }

    #[Test]
    public function test_eliminar_curso()
    {
        $curso = $this->crearCurso();
        $id = $curso->id_curso;

        $this->repository->eliminarCurso($curso);

        $this->assertDatabaseMissing('cursos', ['id_curso' => $id]);
    }

    #[Test]
    public function test_filtrar_cursos_por_usuario_admin()
    {
        $curso = $this->crearCurso(['estado_id' => 2]);

        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $request = Request::create('/cursos', 'GET', []);

        $resultado = $this->repository->filtrarCursos($request, $usuario);

        $this->assertTrue($resultado->contains('id_curso', $curso->id_curso));
    }

    #[Test]
    public function test_filtrar_cursos_usuario_normal_solo_ve_publicados()
    {
        $cursoBorrador  = $this->crearCurso(['estado_id' => 2]);
        $cursoPublicado = $this->crearCurso(['estado_id' => 1]);

        $usuario = Usuario::factory()->create(['id_rol' => 3]);

        $request = Request::create('/cursos', 'GET', []);

        $resultado = $this->repository->filtrarCursos($request, $usuario);

        $this->assertFalse($resultado->contains('id_curso', $cursoBorrador->id_curso));
        $this->assertTrue($resultado->contains('id_curso', $cursoPublicado->id_curso));
    }
}