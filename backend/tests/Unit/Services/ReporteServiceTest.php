<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use App\Services\ReporteServices\ReporteService;
use App\Repositories\ReporteRepositories\ReporteRepository;
use App\Models\Usuario;

class ReporteServiceTest extends TestCase
{
    private $repoMock;
    private ReporteService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repoMock = $this->mock(ReporteRepository::class);
        $this->service  = new ReporteService($this->repoMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function test_obtener_reporte_egresados_retorna_array()
    {
        $this->repoMock
            ->shouldReceive('obtenerReporteEgresadosRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                (object) ['nombre' => 'Juan', 'carrera' => 'Ingeniería'],
            ]);

        $resultado = $this->service->obtenerReporteEgresados(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertIsArray($resultado);
        $this->assertCount(1, $resultado);
    }

    #[Test]
    public function test_obtener_reporte_egresados_retorna_array_vacio_sin_datos()
    {
        $this->repoMock
            ->shouldReceive('obtenerReporteEgresadosRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $resultado = $this->service->obtenerReporteEgresados(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertIsArray($resultado);
        $this->assertEmpty($resultado);
    }

    #[Test]
    public function test_obtener_grafico_empleo_retorna_estructura_correcta()
    {
        $this->repoMock
            ->shouldReceive('obtenerGraficoEmpleoRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                (object) [
                    'total'               => 100,
                    'empleados'           => 70,
                    'desempleados'        => 20,
                    'no_especificado'     => 10,
                    'pct_empleados'       => 70.0,
                    'pct_desempleados'    => 20.0,
                    'pct_no_especificado' => 10.0,
                ]
            ]);

        $resultado = $this->service->obtenerGraficoEmpleo(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey('total', $resultado);
        $this->assertArrayHasKey('empleados', $resultado);
        $this->assertArrayHasKey('pct_empleados', $resultado);
        $this->assertEquals(100, $resultado['total']);
        $this->assertEquals(70, $resultado['empleados']);
    }

    #[Test]
    public function test_obtener_grafico_empleo_retorna_ceros_sin_datos()
    {
        $this->repoMock
            ->shouldReceive('obtenerGraficoEmpleoRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $resultado = $this->service->obtenerGraficoEmpleo(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertEquals(0, $resultado['total']);
        $this->assertEquals(0, $resultado['empleados']);
        $this->assertEquals(0, $resultado['pct_empleados']);
    }

    #[Test]
    public function test_obtener_grafico_anual_retorna_array()
    {
        $this->repoMock
            ->shouldReceive('obtenerGraficoAnualRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                (object) ['anio' => 2023, 'total_egresados' => 50],
                (object) ['anio' => 2024, 'total_egresados' => 60],
            ]);

        $resultado = $this->service->obtenerGraficoAnual(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertIsArray($resultado);
        $this->assertCount(2, $resultado);
    }

    #[Test]
    public function test_obtener_grafico_por_carrera_retorna_array()
    {
        $this->repoMock
            ->shouldReceive('obtenerGraficoPorCarreraRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                (object) ['carrera' => 'Ingeniería', 'total_egresados' => 30],
            ]);

        $resultado = $this->service->obtenerGraficoPorCarrera(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertIsArray($resultado);
        $this->assertCount(1, $resultado);
    }

    #[Test]
    public function test_obtener_grafico_genero_retorna_estructura_correcta()
    {
        $this->repoMock
            ->shouldReceive('obtenerGraficoGeneroRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([
                (object) [
                    'total_egresados' => 100,
                    'hombres'         => 60,
                    'mujeres'         => 35,
                    'no_especificado' => 5,
                    'pct_hombres'     => 60.0,
                    'pct_mujeres'     => 35.0,
                ]
            ]);

        $resultado = $this->service->obtenerGraficoGenero(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertIsArray($resultado);
        $this->assertArrayHasKey('total_egresados', $resultado);
        $this->assertArrayHasKey('hombres', $resultado);
        $this->assertArrayHasKey('pct_mujeres', $resultado);
        $this->assertEquals(100, $resultado['total_egresados']);
    }

    #[Test]
    public function test_obtener_grafico_genero_retorna_ceros_sin_datos()
    {
        $this->repoMock
            ->shouldReceive('obtenerGraficoGeneroRaw')
            ->once()
            ->withAnyArgs()
            ->andReturn([]);

        $resultado = $this->service->obtenerGraficoGenero(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );

        $this->assertEquals(0, $resultado['total_egresados']);
        $this->assertEquals(0, $resultado['hombres']);
        $this->assertEquals(0, $resultado['pct_hombres']);
    }

    #[Test]
    public function test_obtener_datos_iniciales_retorna_estructura()
    {
        $usuario = Usuario::factory()->create(['id_rol' => 1]);
        $this->actingAs($usuario, 'sanctum');

        $this->repoMock->shouldReceive('obtenerPermisosRol')->once()->with(1)->andReturn([14]);
        $this->repoMock->shouldReceive('obtenerUniversidades')->once()->andReturn(collect([]));
        $this->repoMock->shouldReceive('obtenerCarreras')->once()->andReturn(collect([]));
        $this->repoMock->shouldReceive('obtenerAreasLaborales')->once()->andReturn(collect([]));
        $this->repoMock->shouldReceive('obtenerPaises')->once()->andReturn(collect([]));
        $this->repoMock->shouldReceive('obtenerProvincias')->once()->andReturn(collect([]));
        $this->repoMock->shouldReceive('obtenerCantones')->once()->andReturn(collect([]));

        $resultado = $this->service->obtenerDatosIniciales();

        $this->assertArrayHasKey('userPermisos', $resultado);
        $this->assertArrayHasKey('catalogosIniciales', $resultado);
        $this->assertArrayHasKey('universidades', $resultado['catalogosIniciales']);
        $this->assertArrayHasKey('carreras', $resultado['catalogosIniciales']);
        $this->assertArrayHasKey('generos', $resultado['catalogosIniciales']);
        $this->assertArrayHasKey('estadosEmpleo', $resultado['catalogosIniciales']);
    }
}