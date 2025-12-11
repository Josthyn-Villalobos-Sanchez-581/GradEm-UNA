<?php

namespace App\Services\ReporteServices;

use App\Repositories\ReporteRepositories\ReporteRepository;
use Throwable;
use Illuminate\Support\Facades\Auth;

class ReporteService
{
    protected $repo;

    public function __construct(ReporteRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * Obtener reporte de egresados (tabla detallada)
     * Devuelve colección (array) de filas.
     */
    public function obtenerReporteEgresados(
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

        ?int $pais,
        ?int $provincia,
        ?int $canton,

        ?int $idRol = 7
    ) {
        try {
            $raw = $this->repo->obtenerReporteEgresadosRaw(
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

                $pais,
                $provincia,
                $canton,

                $idRol
            );

            return json_decode(json_encode($raw), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }


    /**
     * Obtener datos para gráfico de empleo (pie / donut).
     * Retorna array con keys: total, empleados, desempleados, no_especificado, pct_...
     */
    public function obtenerGraficoEmpleo(
        ?int $universidad,
        ?int $carrera,
        ?int $fechaInicio,
        ?int $fechaFin,
        ?string $genero
    ) {
        try {
            $raw = $this->repo->obtenerGraficoEmpleoRaw(
                $universidad,
                $carrera,
                $fechaInicio,
                $fechaFin,
                $genero
            );

            $rows = json_decode(json_encode($raw), true);

            // Por seguridad, si no hay filas, devolver zeros
            if (empty($rows)) {
                return [
                    'total' => 0,
                    'empleados' => 0,
                    'desempleados' => 0,
                    'no_especificado' => 0,
                    'pct_empleados' => 0,
                    'pct_desempleados' => 0,
                    'pct_no_especificado' => 0,
                ];
            }

            // Tomamos la primera fila
            $r = $rows[0];

            // Asegurar tipos numericos
            return [
                'total' => (int) ($r['total'] ?? 0),
                'empleados' => (int) ($r['empleados'] ?? 0),
                'desempleados' => (int) ($r['desempleados'] ?? 0),
                'no_especificado' => (int) ($r['no_especificado'] ?? 0),
                'pct_empleados' => (float) ($r['pct_empleados'] ?? 0),
                'pct_desempleados' => (float) ($r['pct_desempleados'] ?? 0),
                'pct_no_especificado' => (float) ($r['pct_no_especificado'] ?? 0),
            ];
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /**
     * Obtener datos para gráfico anual (series por año)
     * Devuelve array de { anio, total_egresados }
     */
    public function obtenerGraficoAnual(
        ?int $universidad,
        ?int $carrera,
        ?int $fechaInicio,
        ?int $fechaFin,
        ?string $genero,
        ?string $estadoEmpleo
    ) {
        try {
            $raw = $this->repo->obtenerGraficoAnualRaw(
                $universidad,
                $carrera,
                $fechaInicio,
                $fechaFin,
                $genero,
                $estadoEmpleo
            );

            $rows = json_decode(json_encode($raw), true);
            return $rows; // ya vienen como [{ anio:..., total_egresados:... }, ...]
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /* ============================================================
       ===============    CATÁLOGOS DESDE BD     ==================
       ============================================================ */

    public function obtenerUniversidades()
    {
        try {
            return json_decode(json_encode(
                $this->repo->obtenerUniversidades()
            ), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerCarreras()
    {
        try {
            return json_decode(json_encode(
                $this->repo->obtenerCarreras()
            ), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerAreasLaborales()
    {
        try {
            return json_decode(json_encode(
                $this->repo->obtenerAreasLaborales()
            ), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerPaises()
    {
        try {
            return json_decode(json_encode(
                $this->repo->obtenerPaises()
            ), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerProvincias()
    {
        try {
            return json_decode(json_encode(
                $this->repo->obtenerProvincias()
            ), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerCantones()
    {
        try {
            return json_decode(json_encode(
                $this->repo->obtenerCantones()
            ), true);
        } catch (Throwable $e) {
            throw $e;
        }
    }

    public function obtenerDatosIniciales()
    {
        $usuario = Auth::user();

        return [
            'userPermisos' => $this->repo->obtenerPermisosRol($usuario->id_rol),
        ];
    }
}
