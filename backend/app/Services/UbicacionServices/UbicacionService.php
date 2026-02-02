<?php

namespace App\Services\UbicacionServices;

use App\Repositories\UbicacionRepositories\UbicacionRepository;

class UbicacionService
{
    protected UbicacionRepository $ubicacionRepository;

    public function __construct(UbicacionRepository $ubicacionRepository)
    {
        $this->ubicacionRepository = $ubicacionRepository;
    }

    /**
     * Obtener todos los países.
     */
    public function obtenerPaises()
    {
        return $this->ubicacionRepository->traerPaises();
    }

    /**
     * Obtener provincias por país.
     */
    public function obtenerProvinciasPorPais(int $idPais)
    {
        return $this->ubicacionRepository->traerProvinciasPorPais($idPais);
    }

    /**
     * Obtener cantones por provincia.
     */
    public function obtenerCantonesPorProvincia(int $idProvincia)
    {
        return $this->ubicacionRepository->traerCantonesPorProvincia($idProvincia);
    }
}
