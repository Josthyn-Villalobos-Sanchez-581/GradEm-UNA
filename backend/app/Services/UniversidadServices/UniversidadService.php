<?php

namespace App\Services\UniversidadServices;

use App\Repositories\UniversidadRepositories\UniversidadRepository;

class UniversidadService
{
    protected UniversidadRepository $universidadRepository;

    public function __construct(UniversidadRepository $universidadRepository)
    {
        $this->universidadRepository = $universidadRepository;
    }

    /**
     * Obtener lista completa de universidades
     */
    public function obtenerUniversidades()
    {
        return $this->universidadRepository->traerUniversidades();
    }

    /**
     * Obtener carreras según universidad
     */
    public function obtenerCarrerasPorUniversidad(int $idUniversidad)
    {
        return $this->universidadRepository->traerCarrerasPorUniversidad($idUniversidad);
    }
}
