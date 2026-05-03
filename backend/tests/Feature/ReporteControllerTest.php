<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use PHPUnit\Framework\Attributes\Test;
use App\Models\Usuario;
use App\Services\ReporteServices\ReporteService;
use Mockery;

class ReporteControllerTest extends TestCase
{
    use DatabaseTransactions;

    private $serviceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware();

        $this->serviceMock = Mockery::mock(ReporteService::class);
        $this->app->instance(ReporteService::class, $this->serviceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function datosIniciales(): array
    {
        return [
            'userPermisos'       => [14],
            'catalogosIniciales' => [
                'universidades'     => [],
                'carreras'          => [],
                'areasLaborales'    => [],
                'paises'            => [],
                'provincias'        => [],
                'cantones'          => [],
                'generos'           => [],
                'estadosEstudios'   => [],
                'nivelesAcademicos' => [],
                'estadosEmpleo'     => [],
                'rangosSalariales'  => [],
                'tiposEmpleo'       => [],
            ],
        ];
    }

    #[Test]
    public function test_index_retorna_vista_correcta()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerDatosIniciales')
            ->once()
            ->andReturn($this->datosIniciales());

        $response = $this->actingAs($usuario, 'sanctum')
            ->withHeaders(['X-Inertia' => 'true'])
            ->getJson('/reportes-egresados');

        $response->assertStatus(200)
                 ->assertJsonPath('component', 'Reportes/ReporteEgresados');
    }

    #[Test]
    public function test_obtener_egresados_retorna_json()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerReporteEgresados')
            ->once()
            ->withAnyArgs()
            ->andReturn([['nombre' => 'Juan']]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/egresados');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_obtener_egresados_con_filtros_invalidos_devuelve_422()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/egresados?fecha_inicio=1900');

        $response->assertStatus(422);
    }

    #[Test]
    public function test_grafico_empleo_retorna_json()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerGraficoEmpleo')
            ->once()
            ->withAnyArgs()
            ->andReturn(['total' => 10, 'empleados' => 7]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/grafico-empleo');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_grafico_anual_retorna_json()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerGraficoAnual')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/grafico-anual');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_grafico_por_carrera_retorna_json()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerGraficoPorCarrera')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/grafico-por-carrera');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_grafico_genero_retorna_json()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerGraficoGenero')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/grafico-genero');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_descargar_pdf_sin_datos_requeridos_devuelve_422()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $response = $this->actingAs($usuario, 'sanctum')
            ->postJson('/reportes/descargar-pdf', []);

        $response->assertStatus(422);
    }

    #[Test]
    public function test_obtener_egresados_devuelve_500_si_service_falla()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);

        $this->serviceMock
            ->shouldReceive('obtenerReporteEgresados')
            ->once()
            ->withAnyArgs()
            ->andThrow(new \Exception('Error interno'));

        $response = $this->actingAs($usuario, 'sanctum')
            ->getJson('/reportes/egresados');

        $response->assertStatus(500)
                 ->assertJson(['success' => false]);
    }
}