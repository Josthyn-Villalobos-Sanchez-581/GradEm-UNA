<?php

namespace Tests\Features;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Models\Curso;
use App\Models\Modalidad;

class CursoControllerTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();
    }

    private function crearModalidad(): Modalidad
    {
        return Modalidad::create(['nombre' => 'Modalidad ' . uniqid()]);
    }

    private function crearCurso(array $extra = []): Curso
    {
        $modalidad = $this->crearModalidad();

        return Curso::create(array_merge([
            'titulo'                   => 'Curso Test ' . uniqid(),
            'descripcion'              => 'Descripción válida del curso de prueba',
            'id_modalidad'             => $modalidad->id_modalidad,
            'fecha_inicio'             => now()->addDays(5)->toDateString(),
            'fecha_fin'                => now()->addDays(30)->toDateString(),
            'fecha_limite_inscripcion' => now()->addDays(3)->toDateString(),
            'duracion'                 => '10 horas',
            'nombreInstructor'         => 'Instructor Test',
            'cupos'                    => 20,
            'estado_id'                => 7,
        ], $extra));
    }

    #[Test]
    public function test_index_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/cursos');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Cursos/Index');
    }

    #[Test]
    public function test_store_crea_curso_correctamente()
    {
        $usuario   = Usuario::factory()->create(['id_rol' => 1]);
        $modalidad = $this->crearModalidad();

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/cursos', [
                'titulo'                   => 'Curso nuevo válido',
                'descripcion'              => 'Descripción válida con más de diez caracteres',
                'id_modalidad'             => $modalidad->id_modalidad,
                'fecha_inicio'             => now()->addDays(5)->toDateString(),
                'fecha_fin'                => now()->addDays(30)->toDateString(),
                'fecha_limite_inscripcion' => now()->addDays(3)->toDateString(),
                'duracion'                 => '10 horas',
                'nombreInstructor'         => 'Instructor Test',
                'cupos'                    => 20,
            ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_store_falla_validacion_con_datos_invalidos()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/cursos', [
                'fecha_fin'   => now()->subDays(5)->toDateString(),
                'fecha_inicio' => now()->addDays(10)->toDateString(),
            ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_publicar_curso_exitosamente()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);
        $curso   = $this->crearCurso(['estado_id' => 7]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->putJson("/cursos/{$curso->id_curso}/publicar");

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
public function test_publicar_curso_ya_publicado_devuelve_500()
{
    $usuario = Usuario::factory()->create(['id_rol' => 1]);
    $curso   = $this->crearCurso(['estado_id' => 1]); // activo = ya publicado

    $response = $this->actingAs($usuario, 'sanctum')
        ->putJson("/cursos/{$curso->id_curso}/publicar");

    // El service lanza \Exception (no \DomainException), el controller no la captura → 500
    $response->assertStatus(500);
}

    #[Test]
    public function test_update_curso_existente()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);
        $curso   = $this->crearCurso();

        $response = $this->actingAs($usuario, 'sanctum')
            ->putJson("/cursos/{$curso->id_curso}", [
                'titulo'          => 'Título actualizado',
                'descripcion'     => 'Descripción actualizada con suficientes caracteres',
                'nombreInstructor' => 'Nuevo Instructor',
            ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_update_curso_inexistente_devuelve_404()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->putJson('/cursos/999999', [
                'titulo' => 'Título actualizado',
            ]);

        $response->assertStatus(404);
    }

    #[Test]
    public function test_destroy_curso_sin_motivo_falla_validacion()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);
        $curso   = $this->crearCurso();

        $response = $this->actingAs($usuario, 'sanctum')
            ->deleteJson("/cursos/{$curso->id_curso}", []);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_inscritos_curso_inexistente_devuelve_404()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/cursos/999999/inscritos');

        $response->assertStatus(404);
    }

    #[Test]
    public function test_inscritos_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);
        $curso   = $this->crearCurso();

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson("/cursos/{$curso->id_curso}/inscritos");

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Cursos/GestionInscritos');
    }
}