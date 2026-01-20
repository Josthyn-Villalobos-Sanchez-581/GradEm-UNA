<?php

namespace App\Repositories\DocumentosRepositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentoRepository
{
    public function obtenerAdjuntosPorUsuario($idUsuario)
    {
        $adjuntos = DB::table('documentos_adjuntos')
            ->where('id_usuario', $idUsuario)
            ->select(
                'id_documento',
                'tipo',
                'ruta_archivo',
                'nombre_original',
                'fecha_subida'
            )
            ->orderBy('fecha_subida', 'desc')
            ->get();

        return $adjuntos->map(function ($doc) {
            $doc->rutaPublica = asset('storage/' . $doc->ruta_archivo);
            return $doc;
        });
    }

    public function eliminarAdjunto($idDocumento)
    {
        $doc = DB::table('documentos_adjuntos')->where('id_documento', $idDocumento)->first();
        if (!$doc) {
            return false;
        }

        if ($doc->ruta_archivo && Storage::disk('public')->exists($doc->ruta_archivo)) {
            Storage::disk('public')->delete($doc->ruta_archivo);
        }

        DB::table('documentos_adjuntos')->where('id_documento', $idDocumento)->delete();
        return true;
    }
}
