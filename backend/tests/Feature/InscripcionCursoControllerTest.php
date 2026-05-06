<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Services\InscripcionCursoServices\InscripcionCursoService;
use Mockery;

class InscripcionCursoControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $serviceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();

        $this->serviceMock = Mockery::mock(InscripcionCursoService::class);
        $this->app->instance(InscripcionCursoService::class, $this->serviceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function test_store_inscripcion_exitosa()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('inscribir')
            ->once()
            ->with(1, $usuario->id_usuario);

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/cursos/1/inscribirse');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_store_lanza_domain_exception_devuelve_422()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('inscribir')
            ->once()
            ->andThrow(new \DomainException('Ya se encuentra inscrito/a en este curso.'));

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/cursos/1/inscribirse');

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Ya se encuentra inscrito/a en este curso.',
                 ]);
    }

    #[Test]
    public function test_estado_retorna_json_correcto()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('estaInscrito')
            ->once()
            ->with(1, $usuario->id_usuario)
            ->andReturn(false);

        $this->serviceMock
            ->shouldReceive('cuposDisponibles')
            ->once()
            ->with(1)
            ->andReturn(5);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/cursos/1/inscripcion-estado');

        $response->assertStatus(200)
                 ->assertJson([
                     'inscrito'          => false,
                     'cupos_disponibles' => 5,
                 ]);
    }

    #[Test]
    public function test_mis_cursos_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('obtenerMisCursos')
            ->once()
            ->with($usuario->id_usuario)
            ->andReturn(collect([]));

        $this->serviceMock
            ->shouldReceive('obtenerInscritosCount')
            ->once()
            ->andReturn([]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/cursos/mis-cursos');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Cursos/MisCursos');
    }

    #[Test]
    public function test_cancelar_exitosamente()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('cancelar')
            ->once()
            ->with(1, $usuario->id_usuario);

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/cursos/cursos/1/cancelar');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_cancelar_lanza_domain_exception_devuelve_422()
    {
        $usuario = Usuario::factory()->create();

        $this->serviceMock
            ->shouldReceive('cancelar')
            ->once()
            ->andThrow(new \DomainException('No está inscrito en este curso.'));

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/cursos/cursos/1/cancelar');

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'No está inscrito en este curso.',
                 ]);
    }
}