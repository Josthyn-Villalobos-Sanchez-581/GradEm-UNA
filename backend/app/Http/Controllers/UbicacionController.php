<?php

namespace App\Http\Controllers;

use App\Services\UbicacionServices\UbicacionService;

class UbicacionController extends Controller
{
    protected UbicacionService $ubicacionService;

    public function __construct(UbicacionService $ubicacionService)
    {
        $this->ubicacionService = $ubicacionService;
    }

    public function getPaises()
    {
        $paises = $this->ubicacionService->obtenerPaises();

        return response()->json($paises);
    }

    public function getProvincias($id_pais)
    {
        $provincias = $this->ubicacionService->obtenerProvinciasPorPais((int) $id_pais);

        return response()->json($provincias);
    }

    public function getCantones($id_provincia)
    {
        $cantones = $this->ubicacionService->obtenerCantonesPorProvincia((int) $id_provincia);

        return response()->json($cantones);
    }
}
