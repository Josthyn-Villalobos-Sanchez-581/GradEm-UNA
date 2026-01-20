<?php

namespace App\Http\Controllers;

use App\Http\Requests\Curriculum\GenerarCurriculumRequest;
use App\Services\CurriculumServices\CurriculumService;
use App\Services\ServicioPlantillaCurriculum;
use Illuminate\Http\Request;


class CurriculumController extends Controller
{
    protected $service;

    public function __construct(CurriculumService $service)
    {
        $this->service = $service;
    }

    public function generar(GenerarCurriculumRequest $request, ServicioPlantillaCurriculum $servicio)
    {
        try {
            return $this->service->generar($request, $servicio);
        } catch (\Exception $e) {
            return response()->json(['ok' => false, 'mensaje' => $e->getMessage()], 500);
        }
    }

    public function create()
    {
        try {
            return $this->service->create();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function indexCarga()
    {
        try {
            return $this->service->indexCarga();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function uploadApi(Request $request)
    {
        try {
            return $this->service->uploadApi($request);
        } catch (\Exception $e) {
            return response()->json(['ok' => false, 'mensaje' => $e->getMessage()], 500);
        }
    }

    public function delete(Request $request)
    {
        try {
            return $this->service->delete($request);
        } catch (\Exception $e) {
            return response()->json(['ok' => false, 'mensaje' => $e->getMessage()], 500);
        }
    }

    public function verMiCurriculum()
    {
        try {
            return $this->service->verMiCurriculum();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function vistaVerCurriculum()
    {
        try {
            return $this->service->vistaVerCurriculum();
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }
    }

    public function obtenerAdjuntos()
    {
        try {
            return $this->service->obtenerAdjuntos();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
