<?php
namespace App\Services;

use App\Repositories\UbicacionRepository;
use Illuminate\Support\Facades\Cache;

class UbicacionService
{
    protected $repo;

    public function __construct(UbicacionRepository $repo)
    {
        $this->repo = $repo;
    }

    public function getPaises()
    {
        // Si querés cache, descomenta Cache::remember
        // return Cache::remember('ubicacion.paises', 3600, fn() => $this->repo->allPaises());
        return $this->repo->allPaises();
    }

    public function getProvinciasPorPais(int $id_pais)
    {
        return $this->repo->provinciasPorPais($id_pais);
    }

    public function getCantonesPorProvincia(int $id_provincia)
    {
        return $this->repo->cantonesPorProvincia($id_provincia);
    }

    public function getJerarquiaCompleta()
    {
        return $this->repo->jerarquiaCompleta();
    }
}
