<?php

namespace App\Repositories\UniversidadRepositories;

use App\Models\Universidad;
use App\Models\Carrera;

class UniversidadRepository
{
    /**
     * Traer todas las universidades
     */
 public function traerUniversidades()
{
    return Universidad::select(
        'id_universidad',
        'nombre',
        'sigla'
    )
    ->orderBy('nombre')
    ->get();
}

    /**
     * Traer carreras filtradas por universidad
     */
    public function traerCarrerasPorUniversidad(int $idUniversidad)
    {
        return Carrera::where('id_universidad', $idUniversidad)->get();
    }
}
