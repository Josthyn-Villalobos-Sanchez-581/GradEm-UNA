<?php
namespace Tests\Unit\Services; 
use Tests\TestCase;
use Mockery;
use App\Services\EstadisticasServices\EstadisticasService;
use App\Repositories\EstadisticasRepositories\EstadisticasRepository;
    use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
class EstadisticasServiceTest extends TestCase
{
    public function test_obtener_kpis_con_datos()
    {
        $mockRepo = Mockery::mock(EstadisticasRepository::class);

        $mockRepo->shouldReceive('obtenerKpisRaw')
            ->once()
            ->andReturn([
                (object)[
                    'total_ofertas' => 10,
                    'ofertas_activas' => 5,
                    'total_postulaciones' => 20,
                    'empresas_activas' => 3
                ]
            ]);

        $service = new EstadisticasService($mockRepo);

        $result = $service->obtenerKpis(null, null, null, null, null);

        $this->assertEquals(10, $result['total_ofertas']);
        $this->assertEquals(5, $result['ofertas_activas']);
        $this->assertEquals(20, $result['total_postulaciones']);
        $this->assertEquals(3, $result['empresas_activas']);
    }
        public function test_obtener_kpis_sin_datos()
    {
        $mockRepo = Mockery::mock(EstadisticasRepository::class);

        $mockRepo->shouldReceive('obtenerKpisRaw')
            ->once()
            ->andReturn([]);

        $service = new EstadisticasService($mockRepo);

        $result = $service->obtenerKpis(null, null, null, null, null);

        $this->assertEquals(0, $result['total_ofertas']);
        $this->assertEquals(0, $result['total_postulaciones']);
        $this->assertEquals(0, $result['empresas_activas']);
        $this->assertNull($result['top_campo']);
    }

        public function test_obtener_top_carreras_con_tendencia()
    {
        $mockRepo = Mockery::mock(EstadisticasRepository::class);

        // periodo actual
        $mockRepo->shouldReceive('obtenerTopCarrerasRaw')
            ->once()
            ->andReturn([
                (object)['carrera' => 'Sistemas', 'vacantes' => 20]
            ]);

        // periodo anterior
        $mockRepo->shouldReceive('obtenerTopCarrerasRaw')
            ->once()
            ->andReturn([
                (object)['carrera' => 'Sistemas', 'vacantes' => 10]
            ]);

        $service = new EstadisticasService($mockRepo);

        $result = $service->obtenerTopCarreras(
            '2024-01-01',
            '2024-01-31',
            null,
            null
        );

        $this->assertEquals('Sistemas', $result[0]['carrera']);
        $this->assertEquals(20, $result[0]['vacantes']);
        $this->assertEquals(100.0, $result[0]['tendencia']); // 🔥 clave
    }



public function test_obtener_datos_iniciales()
{
    $mockRepo = Mockery::mock(EstadisticasRepository::class);

    $mockRepo->shouldReceive('obtenerPermisosRol')->andReturn([1, 2]);
    $mockRepo->shouldReceive('obtenerCarreras')->andReturn([]);
    $mockRepo->shouldReceive('obtenerEmpresas')->andReturn([]);

    Auth::shouldReceive('user')->andReturn((object)[
        'id_rol' => 2
    ]);

    $service = new EstadisticasService($mockRepo);

    $result = $service->obtenerDatosIniciales();

    $this->assertArrayHasKey('userPermisos', $result);
    $this->assertArrayHasKey('catalogosIniciales', $result);
}

public function test_generar_pdf_reportes()
{
    $mockRepo = Mockery::mock(EstadisticasRepository::class);

    $service = Mockery::mock(EstadisticasService::class, [$mockRepo])
        ->makePartial();

    $service->shouldReceive('obtenerKpis')->andReturn([]);
    $service->shouldReceive('obtenerOfertasPorMes')->andReturn([]);
    $service->shouldReceive('obtenerPostulacionesPorTipo')->andReturn([]);
    $service->shouldReceive('obtenerTopEmpresas')->andReturn([]);
    $service->shouldReceive('obtenerTopCarreras')->andReturn([]);

    Pdf::shouldReceive('loadView')
        ->once()
        ->andReturnSelf();

    Pdf::shouldReceive('setPaper')
        ->once()
        ->andReturnSelf();

      Pdf::shouldReceive('download')
        ->once()
        ->andReturn(response('PDF fake', 200)); // ✅ FIX


    $result = $service->generarPdfReportes(
        ['kpis'],
        [],
        []
    );

   $this->assertInstanceOf(\Illuminate\Http\Response::class, $result);
}
}
