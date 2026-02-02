<?php

namespace App\Http\Controllers;

use App\Services\EstadisticasServices\EstadisticasService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

class EstadisticasController extends Controller
{
    protected EstadisticasService $service;

    public function __construct(EstadisticasService $service)
    {
        $this->service = $service;
    }

    /* ============================================================
       ===============   VISTA PRINCIPAL (INERTIA)   ===============
       ============================================================ */

    public function index()
    {
        $datos = $this->service->obtenerDatosIniciales();
        return Inertia::render('Reportes/ReportesOfertas', $datos);
    }

    /* ============================================================
       ======================== VALIDACIÓN ========================
       ============================================================ */

    private function normalizarFiltros(array $data): array
    {
        foreach ($data as $key => $value) {
            if ($value === '' || $value === 'null') {
                $data[$key] = null;
            }
        }
        return $data;
    }

    private function validarFiltros(Request $request): array
    {
        $maxAno = date('Y') + 1;

        $data = $request->validate([
            'fecha_inicio'     => 'nullable|date',
            'fecha_fin'        => 'nullable|date',

            'tipo_oferta'      => 'nullable|in:empleo,practica,todas',
            'carrera'          => 'nullable|integer',
            'empresa'          => 'nullable|integer',
        ]);

        return $this->normalizarFiltros($data);
    }

    /* ============================================================
       ========================== KPIs =============================
       ============================================================ */

    public function kpis(Request $request)
    {
        try {
            $f = $this->validarFiltros($request);

            return response()->json(
                $this->service->obtenerKpis(
                    $f['fecha_inicio'] ?? null,
                    $f['fecha_fin'] ?? null,
                    $f['tipo_oferta'] ?? null,
                    $f['carrera'] ?? null,
                    $f['empresa'] ?? null
                )
            );
        } catch (Throwable $e) {
            return response()->json([
                'error'   => 'Error al obtener KPIs',
                'detalle' => $e->getMessage(),
            ], 500);
        }
    }

    public function ofertasPorMes(Request $request)
    {
        try {
            $f = $this->validarFiltros($request);

            return response()->json(
                $this->service->obtenerOfertasPorMes(
                    $f['fecha_inicio'] ?? null,
                    $f['fecha_fin'] ?? null,
                    $f['tipo_oferta'] ?? null,
                    $f['carrera'] ?? null,
                    $f['empresa'] ?? null
                )
            );
        } catch (Throwable $e) {
            return response()->json([], 500);
        }
    }

    public function postulacionesPorTipo(Request $request)
    {
        try {
            $f = $this->validarFiltros($request);

            return response()->json(
                $this->service->obtenerPostulacionesPorTipo(
                    $f['fecha_inicio'] ?? null,
                    $f['fecha_fin'] ?? null,
                    $f['tipo_oferta'] ?? null,
                    $f['carrera'] ?? null,
                    $f['empresa'] ?? null
                )
            );
        } catch (Throwable $e) {
            return response()->json([], 500);
        }
    }

    public function topEmpresas(Request $request)
    {
        try {
            $f = $this->validarFiltros($request);

            return response()->json(
                $this->service->obtenerTopEmpresas(
                    $f['fecha_inicio'] ?? null,
                    $f['fecha_fin'] ?? null,
                    $f['tipo_oferta'] ?? null,
                    $f['carrera'] ?? null,
                    $f['empresa'] ?? null
                )
            );
        } catch (Throwable $e) {
            return response()->json([], 500);
        }
    }

    public function topCarreras(Request $request)
    {
        try {
            $f = $this->validarFiltros($request);

            return response()->json(
                $this->service->obtenerTopCarreras(
                    $f['fecha_inicio'] ?? null,
                    $f['fecha_fin'] ?? null,
                    $f['tipo_oferta'] ?? null,
                    $f['empresa'] ?? null
                )
            );
        } catch (Throwable $e) {
            return response()->json([], 500);
        }
    }

    public function descargarPdf(Request $request)
    {
        try {
            $data = $request->validate([
                'reportes'        => 'required|array|min:1',
                'reportes.*'      => 'in:ofertas_mes,postulaciones_tipo,top_empresas,top_carreras',
                'parametros'      => 'required|array',
                'filtrosLegibles' => 'nullable|array',
            ]);

            return $this->service->generarPdfReportes(
                $data['reportes'],
                $data['parametros'],
                $data['filtrosLegibles'] ?? []
            );
        } catch (Throwable $e) {
            return response()->json([
                'error'   => 'Error al generar PDF',
                'detalle' => $e->getMessage(),
            ], 500);
        }
    }
}