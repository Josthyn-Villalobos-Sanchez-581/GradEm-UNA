<?php

namespace App\Repositories\OfertaRepositories;

use App\Models\Oferta;
use App\Models\Postulacion;
use Illuminate\Support\Facades\DB;

class OfertaRepository
{
    public function obtenerConsultaBase()
    {
        return Oferta::with([
            'empresa.usuario.fotoPerfil',
            'pais',
            'provincia',
            'canton',
            'modalidad',
            'areaLaboral',
        ]);
    }

    public function obtenerOfertasVencidasIds()
{
    return Oferta::whereIn('estado_id', [
            Oferta::ESTADO_ACTIVA,
            Oferta::ESTADO_BORRADOR
        ])
        ->where('fecha_limite', '<', now())
        ->pluck('id_oferta');
}

    public function actualizarEstadosMasivo(array $ids, int $nuevoEstado)
    {
        return Oferta::whereIn('id_oferta', $ids)->update(['estado_id' => $nuevoEstado]);
    }

    public function crear(array $datos)
    {
        return Oferta::create($datos);
    }

    public function actualizar(Oferta $oferta, array $datos)
    {
        return $oferta->update($datos);
    }

    public function registrarBitacora(array $datos)
    {
        DB::table('bitacora_cambios')->insert($datos);
    }

    public function obtenerEstadisticasPostulaciones(int $id_oferta)
    {
        return Postulacion::selectRaw("
            COUNT(*) as total,
            SUM(estado_id = 1) as espera,
            SUM(estado_id = 2) as aceptado,
            SUM(estado_id = 3) as negado,
            SUM(estado_id = 4) as revision
        ")
        ->where('id_oferta', $id_oferta)
        ->first();
    }
}