<?php

namespace Tests\Repositories;

use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use App\Repositories\EstadisticasRepositories\EstadisticasRepository;
use Throwable;

class EstadisticasRepositoryTest extends TestCase
{
    /* ================= KPIs ================= */

    public function test_obtener_kpis_raw()
    {
        DB::shouldReceive('select')
            ->once()
            ->with(
                'CALL sp_kpis_estadisticas(?,?,?,?,?)',
                [null, null, null, null, null]
            )
            ->andReturn([
                (object)['total_ofertas' => 10]
            ]);

        $repo = new EstadisticasRepository();

        $result = $repo->obtenerKpisRaw(null, null, null, null, null);

        $this->assertEquals(10, $result[0]->total_ofertas);
    }

    public function test_obtener_kpis_raw_error()
    {
        DB::shouldReceive('select')
            ->once()
            ->andThrow(new \Exception('Error DB'));

        $this->expectException(Throwable::class);

        $repo = new EstadisticasRepository();
        $repo->obtenerKpisRaw(null, null, null, null, null);
    }

    /* ================= OFERTAS POR MES ================= */

    public function test_obtener_ofertas_por_mes_raw()
    {
        DB::shouldReceive('select')
            ->once()
            ->with(
                'CALL sp_ofertas_por_mes(?,?,?,?,?)',
                [null, null, null, null, null]
            )
            ->andReturn([
                (object)['mes' => 'Enero']
            ]);

        $repo = new EstadisticasRepository();

        $result = $repo->obtenerOfertasPorMesRaw(null, null, null, null, null);

        $this->assertEquals('Enero', $result[0]->mes);
    }

    /* ================= TOP CARRERAS ================= */

    public function test_obtener_top_carreras_raw()
    {
        DB::shouldReceive('select')
            ->once()
            ->with(
                'CALL sp_top_carreras(?,?,?,?)',
                [null, null, null, null]
            )
            ->andReturn([
                (object)['carrera' => 'Sistemas']
            ]);

        $repo = new EstadisticasRepository();

        $result = $repo->obtenerTopCarrerasRaw(null, null, null, null);

        $this->assertEquals('Sistemas', $result[0]->carrera);
    }

    /* ================= CARRERAS ================= */

    public function test_obtener_carreras()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('carreras')
            ->andReturnSelf();

        DB::shouldReceive('select')
            ->once()
            ->with('id_carrera as id', 'nombre')
            ->andReturnSelf();

        DB::shouldReceive('orderBy')
            ->once()
            ->with('nombre')
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                (object)['id' => 1, 'nombre' => 'Sistemas']
            ]));

        $repo = new EstadisticasRepository();

        $result = $repo->obtenerCarreras();

        $this->assertEquals('Sistemas', $result[0]->nombre);
    }

    /* ================= EMPRESAS ================= */

    public function test_obtener_empresas()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('empresas')
            ->andReturnSelf();

        DB::shouldReceive('select')
            ->once()
            ->with('id_empresa as id', 'nombre')
            ->andReturnSelf();

        DB::shouldReceive('orderBy')
            ->once()
            ->with('nombre')
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                (object)['id' => 1, 'nombre' => 'Empresa X']
            ]));

        $repo = new EstadisticasRepository();

        $result = $repo->obtenerEmpresas();

        $this->assertEquals('Empresa X', $result[0]->nombre);
    }

    /* ================= PERMISOS ================= */

    public function test_obtener_permisos_rol()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('roles_permisos')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('id_rol', 2)
            ->andReturnSelf();

        DB::shouldReceive('pluck')
            ->once()
            ->with('id_permiso')
            ->andReturn(collect([1, 2, 3]));

        $repo = new EstadisticasRepository();

        $result = $repo->obtenerPermisosRol(2);

        $this->assertEquals([1, 2, 3], $result);
    }
}