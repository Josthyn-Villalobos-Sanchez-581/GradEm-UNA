<?php

namespace App\Http\Controllers;

use App\Services\ReporteServices\ReporteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Exception;


class ReporteController extends Controller
{
    protected $service;

    public function __construct(ReporteService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $datos = $this->service->obtenerDatosIniciales();

        return Inertia::render('Reportes/ReporteEgresados', $datos);
    }

    /**
     * GET /api/reportes/egresados
     * Recibe filtros via query params o body JSON.
     */
    public function obtenerEgresados(Request $request)
    {
        $data = $request->validate([
            'universidad'     => 'nullable|integer',
            'carrera'         => 'nullable|integer',
            'fecha_inicio'    => 'nullable|integer',
            'fecha_fin'       => 'nullable|integer',

            'genero'          => 'nullable|string',
            'estado_estudios' => 'nullable|string',
            'nivel_academico' => 'nullable|string',

            'estado_empleo'   => 'nullable|string',
            'tiempo_empleo'   => 'nullable|integer',
            'area_laboral'    => 'nullable|integer',
            'salario'         => 'nullable|string',
            'tipo_empleo'     => 'nullable|string',

            'pais'            => 'nullable|integer',
            'provincia'       => 'nullable|integer',
            'canton'          => 'nullable|integer',
        ]);

        try {
            $result = $this->service->obtenerReporteEgresados(
                $data['universidad'] ?? null,
                $data['carrera'] ?? null,
                $data['fecha_inicio'] ?? null,
                $data['fecha_fin'] ?? null,
                $data['genero'] ?? null,
                $data['estado_estudios'] ?? null,
                $data['nivel_academico'] ?? null,
                $data['estado_empleo'] ?? null,
                $data['tiempo_empleo'] ?? null,
                $data['area_laboral'] ?? null,
                $data['salario'] ?? null,
                $data['tipo_empleo'] ?? null,

                // NUEVOS CAMPOS
                $data['pais'] ?? null,
                $data['provincia'] ?? null,
                $data['canton'] ?? null,

                7 // id_rol egresado
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * GET /api/reportes/grafico-empleo
     */
    public function graficoEmpleo(Request $request)
    {
        $data = $request->validate([
            'universidad' => 'nullable|integer',
            'carrera' => 'nullable|integer',
            'fecha_inicio' => 'nullable|integer',
            'fecha_fin' => 'nullable|integer',
            'genero' => 'nullable|string',
        ]);

        try {
            $result = $this->service->obtenerGraficoEmpleo(
                $data['universidad'] ?? null,
                $data['carrera'] ?? null,
                $data['fecha_inicio'] ?? null,
                $data['fecha_fin'] ?? null,
                $data['genero'] ?? null
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/reportes/grafico-anual
     */
    public function graficoAnual(Request $request)
    {
        $data = $request->validate([
            'universidad' => 'nullable|integer',
            'carrera' => 'nullable|integer',
            'fecha_inicio' => 'nullable|integer',
            'fecha_fin' => 'nullable|integer',
            'genero' => 'nullable|string',
            'estado_empleo' => 'nullable|string'
        ]);

        try {
            $result = $this->service->obtenerGraficoAnual(
                $data['universidad'] ?? null,
                $data['carrera'] ?? null,
                $data['fecha_inicio'] ?? null,
                $data['fecha_fin'] ?? null,
                $data['genero'] ?? null,
                $data['estado_empleo'] ?? null
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /* ============================================================
       ===============     CATÁLOGOS DESDE BD      ===============
       ============================================================ */

    public function universidades()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->obtenerUniversidades()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function carreras()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->obtenerCarreras()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function areasLaborales()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->obtenerAreasLaborales()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function paises()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->obtenerPaises()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function provincias()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->obtenerProvincias()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function cantones()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->service->obtenerCantones()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function catalogos()
    {
        try {
            return response()->json([
                'success' => true,
                'universidades'      => $this->service->obtenerUniversidades(),
                'carreras'           => $this->service->obtenerCarreras(),
                'areasLaborales'     => $this->service->obtenerAreasLaborales(),
                'paises'             => $this->service->obtenerPaises(),
                'provincias'         => $this->service->obtenerProvincias(),
                'cantones'           => $this->service->obtenerCantones(),

                // LOS CATÁLOGOS FIJOS (los que NO vienen de BD)
                'generos' => [
                    ['id' => 'masculino', 'nombre' => 'Masculino'],
                    ['id' => 'femenino', 'nombre' => 'Femenino'],
                    ['id' => 'otro', 'nombre' => 'Otro'],
                ],

                'estadosEstudios' => [
                    ['id' => 'activo', 'nombre' => 'Activo'],
                    ['id' => 'pausado', 'nombre' => 'Pausado'],
                    ['id' => 'finalizado', 'nombre' => 'Finalizado'],
                ],

                'nivelesAcademicos' => [
                    ['id' => 'Diplomado', 'nombre' => 'Diplomado'],
                    ['id' => 'Bachillerato', 'nombre' => 'Bachillerato'],
                    ['id' => 'Licenciatura', 'nombre' => 'Licenciatura'],
                    ['id' => 'Maestría', 'nombre' => 'Maestría'],
                    ['id' => 'Doctorado', 'nombre' => 'Doctorado'],
                ],

                'estadosEmpleo' => [
                    ['id' => 'empleado', 'nombre' => 'Empleado'],
                    ['id' => 'desempleado', 'nombre' => 'Desempleado'],
                ],

                'rangosSalariales' => [
                    ['id' => '<300000', 'nombre' => 'Menor a ₡300,000'],
                    ['id' => '300000-600000', 'nombre' => '₡300,000 - ₡600,000'],
                    ['id' => '600000-1000000', 'nombre' => '₡600,000 - ₡1,000,000'],
                    ['id' => '>1000000', 'nombre' => 'Mayor a ₡1,000,000'],
                ],

                'tiposEmpleo' => [
                    ['id' => 'Tiempo completo', 'nombre' => 'Tiempo completo'],
                    ['id' => 'Medio tiempo', 'nombre' => 'Medio tiempo'],
                    ['id' => 'Temporal', 'nombre' => 'Temporal'],
                    ['id' => 'Independiente', 'nombre' => 'Independiente'],
                    ['id' => 'Práctica', 'nombre' => 'Práctica'],
                ],
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
