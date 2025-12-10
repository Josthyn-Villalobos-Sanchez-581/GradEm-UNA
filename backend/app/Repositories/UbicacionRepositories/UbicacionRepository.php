<?php

namespace App\Repositories\UbicacionRepositories;

use App\Models\Pais;
use App\Models\Provincia;
use App\Models\Canton;

class UbicacionRepository
{
    /**
     * Traer todos los países.
     */
    public function traerPaises()
    {
        // Misma lógica que antes: Pais::all()
        return Pais::all();
    }

    /**
     * Traer provincias filtradas por país.
     */
    public function traerProvinciasPorPais(int $idPais)
    {
        return Provincia::where('id_pais', $idPais)->get();
    }

    /**
     * Traer cantones filtrados por provincia.
     */
    public function traerCantonesPorProvincia(int $idProvincia)
    {
        return Canton::where('id_provincia', $idProvincia)->get();
    }

}
