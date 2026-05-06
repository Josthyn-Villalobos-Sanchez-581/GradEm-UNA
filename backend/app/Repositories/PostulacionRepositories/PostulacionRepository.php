<?php

namespace App\Repositories\PostulacionRepositories;

use App\Models\Postulacion;
use App\Models\Curriculum;

class PostulacionRepository
{
    public function buscarPorUsuarioYOferta($id_usuario, $id_oferta)
    {
        return Postulacion::where('id_usuario', $id_usuario)
            ->where('id_oferta', $id_oferta)
            ->first();
    }

    public function crear(array $datos)
    {
        return Postulacion::create($datos);
    }

    public function actualizar(Postulacion $postulacion, array $datos)
    {
        return $postulacion->update($datos);
    }

    public function findOrFail($id, array $relaciones = [])
    {
        return Postulacion::with($relaciones)->findOrFail($id);
    }

    public function tieneCvValido($id_usuario)
    {
        return Curriculum::where('id_usuario', $id_usuario)
            ->where(function ($query) {
                $query->where('generado_sistema', true)
                    ->orWhereNotNull('ruta_archivo_pdf');
            })
            ->exists();
    }

    public function obtenerConsultaMisPostulaciones($id_usuario)
    {
        return Postulacion::with([
            'oferta.empresa.usuario.fotoPerfil',
            'oferta.pais',
            'oferta.provincia',
            'oferta.canton',
            'oferta.modalidad',
            'oferta.areaLaboral',
        ])->where('id_usuario', $id_usuario);
    }

    public function eliminar(Postulacion $postulacion)
    {
        return $postulacion->delete();
    }

    public function esOfertaVigente($id_oferta)
    {
        return \App\Models\Oferta::where('id_oferta', $id_oferta)
            ->whereDate('fecha_limite', '>=', now())
            ->where('estado_id', 1) // Activa
            ->exists();
    }
}
