<?php

namespace App\Http\Controllers;

use App\Services\EstadisticasServices\EstadisticasService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class EstadisticasController extends Controller
{
    protected $service;

    public function __construct(EstadisticasService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $datos = $this->service->obtenerDatosIniciales();

        return Inertia::render('Reportes/ReportesOfertas', $datos);
    }

    public function obtenerKpis(Request $request)
    {
        try {
            $result = $this->service->obtenerKpis(
                $request->fecha_inicio,
                $request->fecha_fin,
                $request->tipo_oferta,
                $request->campo_aplicacion,
                $request->empresa_nombre
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function obtenerOfertasPorMes(Request $request)
    {
        try {
            $result = $this->service->obtenerOfertasPorMes(
                $request->fecha_inicio,
                $request->fecha_fin,
                $request->tipo_oferta,
                $request->campo_aplicacion,
                $request->empresa_nombre
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function obtenerPostulacionesTipo(Request $request)
    {
        try {
            $result = $this->service->obtenerPostulacionesTipo(
                $request->fecha_inicio,
                $request->fecha_fin,
                $request->tipo_oferta,
                $request->campo_aplicacion,
                $request->empresa_nombre
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function obtenerTopEmpresas(Request $request)
    {
        try {
            $result = $this->service->obtenerTopEmpresas(
                $request->fecha_inicio,
                $request->fecha_fin,
                $request->tipo_oferta,
                $request->campo_aplicacion,
                $request->empresa_nombre
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function obtenerTopCarreras(Request $request)
    {
        try {
            $result = $this->service->obtenerTopCarreras(
                $request->fecha_inicio,
                $request->fecha_fin,
                $request->tipo_oferta,
                $request->campo_aplicacion,
                $request->empresa_nombre
            );

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
