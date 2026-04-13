<?php

namespace Tests\Feature;

use Tests\TestCase;
use Mockery;
use App\Services\EstadisticasServices\EstadisticasService;

class EstadisticasControllerTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /* ============================================================
       ======================= KPIS OK =============================
       ============================================================ */

    public function test_kpis_exitoso()
    {
        $this->withoutMiddleware();

        $mock = Mockery::mock(EstadisticasService::class);
        $mock->shouldReceive('obtenerKpis')
            ->once()
            ->andReturn([
                'total' => 100
            ]);

        $this->app->instance(EstadisticasService::class, $mock);

        $response = $this->getJson('/estadisticas/ofertas/kpis');

        $response->assertStatus(200)
                 ->assertJson([
                     'total' => 100
                 ]);
    }

    /* ============================================================
       ======================= KPIS ERROR ==========================
       ============================================================ */

    public function test_kpis_error_controlado()
    {
        $this->withoutMiddleware();

        $mock = Mockery::mock(EstadisticasService::class);
        $mock->shouldReceive('obtenerKpis')
            ->once()
            ->andThrow(new \Exception('Error'));

        $this->app->instance(EstadisticasService::class, $mock);

        $response = $this->getJson('/estadisticas/ofertas/kpis');

        $response->assertStatus(500)
                 ->assertJsonStructure([
                     'error',
                     'detalle'
                 ]);
    }

    /* ============================================================
       ================= OFERTAS POR MES ===========================
       ============================================================ */

    public function test_ofertas_por_mes()
    {
        $this->withoutMiddleware();

        $mock = Mockery::mock(EstadisticasService::class);
        $mock->shouldReceive('obtenerOfertasPorMes')
            ->once()
            ->andReturn([
                ['mes' => 'Enero']
            ]);

        $this->app->instance(EstadisticasService::class, $mock);

        $response = $this->getJson('/estadisticas/ofertas/ofertas-mes');

        $response->assertStatus(200)
                 ->assertJson([
                     ['mes' => 'Enero']
                 ]);
    }

    /* ============================================================
       ============== POSTULACIONES POR TIPO =======================
       ============================================================ */

    public function test_postulaciones_por_tipo()
    {
        $this->withoutMiddleware();

        $mock = Mockery::mock(EstadisticasService::class);
        $mock->shouldReceive('obtenerPostulacionesPorTipo')
            ->once()
            ->andReturn([
                ['tipo' => 'empleo']
            ]);

        $this->app->instance(EstadisticasService::class, $mock);

        $response = $this->getJson('/estadisticas/ofertas/postulaciones-tipo');

        $response->assertStatus(200);
    }

    /* ============================================================
       ===================== TOP EMPRESAS ==========================
       ============================================================ */

    public function test_top_empresas()
    {
        $this->withoutMiddleware();

        $mock = Mockery::mock(EstadisticasService::class);
        $mock->shouldReceive('obtenerTopEmpresas')
            ->once()
            ->andReturn([
                ['empresa' => 'Empresa X']
            ]);

        $this->app->instance(EstadisticasService::class, $mock);

        $response = $this->getJson('/estadisticas/ofertas/top-empresas');

        $response->assertStatus(200);
    }

    /* ============================================================
       ===================== TOP CARRERAS ==========================
       ============================================================ */

    public function test_top_carreras()
    {
        $this->withoutMiddleware();

        $mock = Mockery::mock(EstadisticasService::class);
        $mock->shouldReceive('obtenerTopCarreras')
            ->once()
            ->andReturn([
                ['carrera' => 'Sistemas']
            ]);

        $this->app->instance(EstadisticasService::class, $mock);

        $response = $this->getJson('/estadisticas/ofertas/top-carreras');

        $response->assertStatus(200);
    }

    /* ============================================================
       ===================== PDF OK ================================
       ============================================================ */

  
    
}