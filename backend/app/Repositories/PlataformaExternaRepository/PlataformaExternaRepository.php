<?php

namespace App\Repositories;

use App\Models\PlataformaExterna;

class PlataformaExternaRepository
{
    public function crear(array $datos): PlataformaExterna
    {
        return PlataformaExterna::create($datos);
    }

    public function obtenerPorUsuario(int $idUsuario)
    {
        return PlataformaExterna::where('id_usuario', $idUsuario)->get();
    }

    public function obtenerPorId(int $idPlataforma): PlataformaExterna
    {
        return PlataformaExterna::findOrFail($idPlataforma);
    }

    public function eliminar(PlataformaExterna $plataforma): void
    {
        $plataforma->delete();
    }
}
