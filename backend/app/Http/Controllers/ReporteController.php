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
        $maxAno = date('Y') + 100;

        $data = $request->validate([
            'universidad'     => 'nullable|integer',
            'carrera'         => 'nullable|integer',
            'fecha_inicio' => "nullable|integer|min:2007|max:$maxAno",
            'fecha_fin'    => "nullable|integer|min:2007|max:$maxAno",

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
                $data['canton'] ?? null
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
        $maxAno = date('Y') + 100;
        $data = $request->validate([
            'universidad'     => 'nullable|integer',
            'carrera'         => 'nullable|integer',
            'fecha_inicio' => "nullable|integer|min:2007|max:$maxAno",
            'fecha_fin'    => "nullable|integer|min:2007|max:$maxAno",

            'genero'          => 'nullable|string',
            'estado_estudios' => 'nullable|string',
            'nivel_academico' => 'nullable|string',

            'tiempo_empleo'   => 'nullable|integer',
            'area_laboral'    => 'nullable|integer',
            'salario'         => 'nullable|string',
            'tipo_empleo'     => 'nullable|string',

            'pais'            => 'nullable|integer',
            'provincia'       => 'nullable|integer',
            'canton'          => 'nullable|integer',
        ]);

        try {
            $result = $this->service->obtenerGraficoEmpleo(
                $data['universidad'] ?? null,
                $data['carrera'] ?? null,
                $data['fecha_inicio'] ?? null,
                $data['fecha_fin'] ?? null,
                $data['genero'] ?? null,
                $data['estado_estudios'] ?? null,
                $data['nivel_academico'] ?? null,
                $data['tiempo_empleo'] ?? null,
                $data['area_laboral'] ?? null,
                $data['salario'] ?? null,
                $data['tipo_empleo'] ?? null,
                $data['pais'] ?? null,
                $data['provincia'] ?? null,
                $data['canton'] ?? null
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
        $maxAno = date('Y') + 100;
        $data = $request->validate([
            'universidad'     => 'nullable|integer',
            'carrera'         => 'nullable|integer',
            'fecha_inicio' => "nullable|integer|min:2007|max:$maxAno",
            'fecha_fin'    => "nullable|integer|min:2007|max:$maxAno",

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
            $result = $this->service->obtenerGraficoAnual(
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
                $data['pais'] ?? null,
                $data['provincia'] ?? null,
                $data['canton'] ?? null
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/reportes/grafico-por-carrera
     */
    public function graficoPorCarrera(Request $request)
    {
        $maxAno = date('Y') + 100;

        $data = $request->validate([
            'universidad'     => 'nullable|integer',
            'fecha_inicio'    => "nullable|integer|min:2007|max:$maxAno",
            'fecha_fin'       => "nullable|integer|min:2007|max:$maxAno",

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
            $result = $this->service->obtenerGraficoPorCarrera(
                $data['universidad'] ?? null,
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
                $data['pais'] ?? null,
                $data['provincia'] ?? null,
                $data['canton'] ?? null
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function descargarPdf(Request $request)
    {
        $data = $request->validate([
            'reportes'         => 'required|array|min:1',
            'reportes.*'       => 'in:tabla,pie,barras',
            'parametros'       => 'required|array',
            'filtrosLegibles'  => 'nullable|array',
            'visual'          => 'nullable|array',
        ]);

        return $this->service->generarPdfReportes(
            $data['reportes'],
            $data['parametros'],
            $data['filtrosLegibles'] ?? [],
            $data['visual'] ?? []
        );
    }
}
