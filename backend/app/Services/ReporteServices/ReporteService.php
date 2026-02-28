<?php

namespace App\Services\ReporteServices;

use App\Repositories\ReporteRepositories\ReporteRepository;
use Throwable;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

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
        ?int $canton
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
                $canton
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
        ?string $genero,
        ?string $estadoEstudios,
        ?string $nivelAcademico,
        ?int $tiempoEmpleo,
        ?int $areaLaboral,
        ?string $salario,
        ?string $tipoEmpleo,

        ?int $pais,
        ?int $provincia,
        ?int $canton
    ) {
        try {
            $raw = $this->repo->obtenerGraficoEmpleoRaw(
                $universidad,
                $carrera,
                $fechaInicio,
                $fechaFin,
                $genero,
                $estadoEstudios,
                $nivelAcademico,
                $tiempoEmpleo,
                $areaLaboral,
                $salario,
                $tipoEmpleo,

                $pais,
                $provincia,
                $canton
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
        ?string $estadoEstudios,
        ?string $nivelAcademico,
        ?string $estadoEmpleo,
        ?int $tiempoEmpleo,
        ?int $areaLaboral,
        ?string $salario,
        ?string $tipoEmpleo,

        ?int $pais,
        ?int $provincia,
        ?int $canton
    ) {
        try {
            $raw = $this->repo->obtenerGraficoAnualRaw(
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
                $canton
            );

            $rows = json_decode(json_encode($raw), true);
            return $rows; // ya vienen como [{ anio:..., total_egresados:... }, ...]
        } catch (Throwable $e) {
            throw $e;
        }
    }

    /**
     * Obtener gráfico de egresados por carrera
     * Devuelve array de { id_carrera, carrera, total_egresados }
     */
    public function obtenerGraficoPorCarrera(
        ?int $universidad,
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
        ?int $canton
    ) {
        try {
            $raw = $this->repo->obtenerGraficoPorCarreraRaw(
                $universidad,
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
                $canton
            );

            return json_decode(json_encode($raw), true);
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

            // NUEVO: catálogos iniciales
            'catalogosIniciales' => [
                'universidades'    => $this->obtenerUniversidades(),
                'carreras'         => $this->obtenerCarreras(),
                'areasLaborales'   => $this->obtenerAreasLaborales(),
                'paises'           => $this->obtenerPaises(),
                'provincias'       => $this->obtenerProvincias(),
                'cantones'         => $this->obtenerCantones(),

                // Catálogos fijos
                'generos' => [
                    ['id' => 'masculino', 'nombre' => 'Masculino'],
                    ['id' => 'femenino',  'nombre' => 'Femenino'],
                    ['id' => 'otro',      'nombre' => 'Otro'],
                ],

                'estadosEstudios' => [
                    ['id' => 'activo',     'nombre' => 'Activo'],
                    ['id' => 'pausado',    'nombre' => 'Pausado'],
                    ['id' => 'finalizado', 'nombre' => 'Finalizado'],
                ],

                'nivelesAcademicos' => [
                    ['id' => 'Diplomado',    'nombre' => 'Diplomado'],
                    ['id' => 'Bachillerato', 'nombre' => 'Bachillerato'],
                    ['id' => 'Licenciatura', 'nombre' => 'Licenciatura'],
                    ['id' => 'Maestría',     'nombre' => 'Maestría'],
                    ['id' => 'Doctorado',    'nombre' => 'Doctorado'],
                ],

                'estadosEmpleo' => [
                    ['id' => 'empleado',    'nombre' => 'Empleado'],
                    ['id' => 'desempleado', 'nombre' => 'Desempleado'],
                ],

                'rangosSalariales' => [
                    ['id' => '<300000',         'nombre' => 'Menor a ₡300,000'],
                    ['id' => '300000-600000',   'nombre' => '₡300,000 - ₡600,000'],
                    ['id' => '600000-1000000',  'nombre' => '₡600,000 - ₡1,000,000'],
                    ['id' => '>1000000',        'nombre' => 'Mayor a ₡1,000,000'],
                ],

                'tiposEmpleo' => [
                    ['id' => 'Tiempo completo', 'nombre' => 'Tiempo completo'],
                    ['id' => 'Medio tiempo',    'nombre' => 'Medio tiempo'],
                    ['id' => 'Temporal',        'nombre' => 'Temporal'],
                    ['id' => 'Independiente',   'nombre' => 'Independiente'],
                    ['id' => 'Práctica',        'nombre' => 'Práctica'],
                ],
            ],
        ];
    }

    public function generarPdfReportes(array $reportes, array $p, array $filtrosLegibles = [], array $visual = [])
    {
        $tabla = [];
        $carrera = [];
        $pie = null;
        $barras = [];

        $tabla = [];
        $pie = null;
        $barras = [];

        if (in_array('tabla', $reportes)) {
            $tabla = $this->obtenerReporteEgresados(
                $p['universidad'] ?? null,
                $p['carrera'] ?? null,
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['genero'] ?? null,
                $p['estado_estudios'] ?? null,
                $p['nivel_academico'] ?? null,
                $p['estado_empleo'] ?? null,
                $p['tiempo_empleo'] ?? null,
                $p['area_laboral'] ?? null,
                $p['salario'] ?? null,
                $p['tipo_empleo'] ?? null,
                $p['pais'] ?? null,
                $p['provincia'] ?? null,
                $p['canton'] ?? null
            );
        }

        if (in_array('carrera', $reportes)) {
            $carrera = $this->obtenerGraficoPorCarrera(
                $p['universidad'] ?? null,
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['genero'] ?? null,
                $p['estado_estudios'] ?? null,
                $p['nivel_academico'] ?? null,
                $p['estado_empleo'] ?? null,
                $p['tiempo_empleo'] ?? null,
                $p['area_laboral'] ?? null,
                $p['salario'] ?? null,
                $p['tipo_empleo'] ?? null,
                $p['pais'] ?? null,
                $p['provincia'] ?? null,
                $p['canton'] ?? null
            );
        }


        if (in_array('barras', $reportes)) {
            $barras = $this->obtenerGraficoAnual(
                $p['universidad'] ?? null,
                $p['carrera'] ?? null,
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['genero'] ?? null,
                $p['estado_estudios'] ?? null,
                $p['nivel_academico'] ?? null,
                $p['estado_empleo'] ?? null,
                $p['tiempo_empleo'] ?? null,
                $p['area_laboral'] ?? null,
                $p['salario'] ?? null,
                $p['tipo_empleo'] ?? null,
                $p['pais'] ?? null,
                $p['provincia'] ?? null,
                $p['canton'] ?? null
            );
        }

        if (in_array('pie', $reportes)) {
            $pie = $this->obtenerGraficoEmpleo(
                $p['universidad'] ?? null,
                $p['carrera'] ?? null,
                $p['fecha_inicio'] ?? null,
                $p['fecha_fin'] ?? null,
                $p['genero'] ?? null,
                $p['estado_estudios'] ?? null,
                $p['nivel_academico'] ?? null,
                $p['tiempo_empleo'] ?? null,
                $p['area_laboral'] ?? null,
                $p['salario'] ?? null,
                $p['tipo_empleo'] ?? null,
                $p['pais'] ?? null,
                $p['provincia'] ?? null,
                $p['canton'] ?? null
            );
        }

        return Pdf::loadView('pdf.reportes', [
            'reportes' => $reportes,
            'tabla'    => $tabla,
            'pie'      => $pie,
            'barras'   => $barras,
            'carrera'  => $carrera,
            'filtros'  => $filtrosLegibles,
            'visual'   => $visual,
            'fecha'    => now()->format('d/m/Y H:i'),
        ])
            ->setPaper('a4', 'portrait')
            ->download('Reporte_GradEm_UNA.pdf');
    }
}
