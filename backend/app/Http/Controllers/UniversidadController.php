<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UniversidadServices\UniversidadService;

class UniversidadController extends Controller
{
    protected UniversidadService $universidadService;

    public function __construct(UniversidadService $universidadService)
    {
        $this->universidadService = $universidadService;
    }

    /**
     * Obtener todas las universidades
     */
    public function getUniversidades()
    {
        $universidades = $this->universidadService->obtenerUniversidades();

        return response()->json($universidades);
    }

    /**
     * Obtener carreras por universidad
     */
    public function getCarreras($idUniversidad)
    {
        $carreras = $this->universidadService->obtenerCarrerasPorUniversidad($idUniversidad);

        return response()->json($carreras);
    }
}
