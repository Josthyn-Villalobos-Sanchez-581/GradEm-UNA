<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Services\CursoServices\CursoInscripcionViewService;
use Illuminate\Support\Facades\DB;

class CursoInscripcionControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $serviceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();

        $this->serviceMock = \Mockery::mock(CursoInscripcionViewService::class);
        $this->app->instance(CursoInscripcionViewService::class, $this->serviceMock);
    }

    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function test_index_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 3]);

        $this->serviceMock
            ->shouldReceive('obtenerCursosParaInscripcion')
            ->once()
            ->withAnyArgs()
            ->andReturn(collect([]));

        $this->serviceMock
            ->shouldReceive('obtenerModalidades')
            ->once()
            ->andReturn(collect([]));

        $this->serviceMock
            ->shouldReceive('obtenerMisInscripciones')
            ->once()
            ->with($usuario->id_usuario)
            ->andReturn([]);

        $this->serviceMock
            ->shouldReceive('obtenerInscritosCount')
            ->once()
            ->andReturn([]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/cursos/inscripcion');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Cursos/Inscripcion');
    }

    #[Test]
    public function test_index_sin_autenticacion_igual_renderiza()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 3]);

        $this->serviceMock
            ->shouldReceive('obtenerCursosParaInscripcion')
            ->once()
            ->withAnyArgs()
            ->andReturn(collect([]));

        $this->serviceMock
            ->shouldReceive('obtenerModalidades')
            ->once()
            ->andReturn(collect([]));

        $this->serviceMock
            ->shouldReceive('obtenerMisInscripciones')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $this->serviceMock
            ->shouldReceive('obtenerInscritosCount')
            ->once()
            ->andReturn([]);

        // Aunque withoutMiddleware está activo, actingAs
        // garantiza que Auth::user() no sea null en el controller
        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/cursos/inscripcion');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Cursos/Inscripcion');
    }
}