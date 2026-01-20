<?php
namespace App\Repositories;

use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;

class UbicacionRepository
{
    public function allPaises()
    {
        return Pais::select('id_pais as id', 'nombre')->get();
    }

    public function provinciasPorPais(int $id_pais)
    {
        return Provincia::where('id_pais', $id_pais)
            ->select('id_provincia as id', 'nombre', 'id_pais')
            ->get();
    }

    public function cantonesPorProvincia(int $id_provincia)
    {
        return Canton::where('id_provincia', $id_provincia)
            ->select('id_canton as id', 'nombre', 'id_provincia')
            ->get();
    }

    /**
     * Opcional: traer toda la jerarquía (países con provincias y cantones)
     * útil si querés precargar todo para el frontend.
     */
    public function jerarquiaCompleta()
    {
        return Pais::with(['provincias.cantones'])
            ->select('id_pais', 'nombre')
            ->get();
    }
}
