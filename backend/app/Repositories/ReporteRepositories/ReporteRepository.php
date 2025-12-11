<?php

namespace App\Repositories\ReporteRepositories;

use Illuminate\Support\Facades\DB;
use Throwable;

class ReporteRepository
{
    /**
     * Ejecuta sp_reporte_egresados con los parámetros recibidos.
     * Devuelve array de resultados (cada fila es stdClass).
     */
    public function obtenerReporteEgresadosRaw(
        ?int $universidad,
        ?int $carrera,
        ?int $fechaInicio,
        ?int $fechaFin,
        ?string $genero,
        ?string $estadoEstudios,
        ?string $nivelAcademico,
        ?string $estadoEmpleo,
        ?int $tiempoEmpleo,
        ?int $areaLaboral,
        ?string $salario,
        ?string $tipoEmpleo,
        ?int $canton,
        ?int $idRol
    ) {
        try {
            $params = [
                $universidad,
                $carrera,
                $fechaInicio,
                $fechaFin,
                $genero,
                $estadoEstudios,
                $nivelAcademico,
                $estadoEmpleo,
                $tiempoEmpleo,
                $areaLaboral,
                $salario,
                $tipoEmpleo,
                $canton,
                $idRol
            ];

            // Llamada al SP
            $result = DB::select('CALL sp_reporte_egresados(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', $params);

            return $result;
        } catch (Throwable $e) {
            // Re-lanzar la excepción para que la capa superior la maneje
            throw $e;
        }
    }

    /**
     * Ejecuta sp_reporte_grafico_empleo
     */
    public function obtenerGraficoEmpleoRaw(
        ?int $universidad,
        ?int $carrera,
        ?int $fechaInicio,
        ?int $fechaFin,
        ?string $genero
    ) {
        try {
            $params = [
                $universidad,
                $carrera,
                $fechaInicio,
                $fechaFin,
                $genero
            ];

            $result = DB::select('CALL sp_reporte_grafico_empleo(?,?,?,?,?)', $params);
            return $result;
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /**
     * Ejecuta sp_grafico_barras_egresados_anual
     */
    public function obtenerGraficoAnualRaw(
        ?int $universidad,
        ?int $carrera,
        ?int $fechaInicio,
        ?int $fechaFin,
        ?string $genero,
        ?string $estadoEmpleo
    ) {
        try {
            $params = [
                $universidad,
                $carrera,
                $fechaInicio,
                $fechaFin,
                $genero,
                $estadoEmpleo
            ];

            $result = DB::select('CALL sp_grafico_barras_egresados_anual(?,?,?,?,?,?)', $params);
            return $result;
        } catch (Throwable $e) {
            throw $e;
        }
    }


    public function obtenerUniversidades()
    {
        try {
            return DB::table('universidades')
                ->select('id_universidad as id', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }
    
    public function obtenerCarreras()
    {
        try {
            return DB::table('carreras')
                ->select('id_carrera as id', 'id_universidad', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }


    public function obtenerAreasLaborales()
    {
        try {
            return DB::table('areas_laborales')
                ->select('id_area_laboral as id', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerPaises()
    {
        try {
            return DB::table('paises')
                ->select('id_pais as id', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }


    public function obtenerProvincias()
    {
        try {
            return DB::table('provincias')
                ->select('id_provincia as id', 'id_pais', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerCantones()
    {
        try {
            return DB::table('cantones')
                ->select('id_canton as id', 'id_provincia', 'nombre')
                ->orderBy('nombre')
                ->get();
        } catch (Throwable $e) {
            throw $e;
        }
    }
}
