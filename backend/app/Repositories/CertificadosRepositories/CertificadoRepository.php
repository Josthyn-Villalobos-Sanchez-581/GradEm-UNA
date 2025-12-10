<?php

namespace App\Repositories\CertificadosRepositories;

use App\Models\DocumentoAdjunto;
use Illuminate\Support\Facades\Storage;

class CertificadoRepository
{
    public function getDocumentosByUser($id_usuario)
    {
        return DocumentoAdjunto::where('id_usuario', $id_usuario)
            ->where('tipo', 'certificado')
            ->orderByDesc('fecha_subida')
            ->get();
    }

    public function createDocumento(array $data)
    {
        return DocumentoAdjunto::create($data);
    }

    public function deleteStorageFile($ruta)
    {
        if ($ruta && Storage::disk('public')->exists($ruta)) {
            Storage::disk('public')->delete($ruta);
            return true;
        }
        return false;
    }

    public function findDocumentoByIdAndUser($id_documento, $id_usuario)
    {
        return DocumentoAdjunto::where('id_documento', $id_documento)
            ->where('id_usuario', $id_usuario)
            ->where('tipo', 'certificado')
            ->first();
    }

    public function deleteDocumentoModel($documento)
    {
        return $documento->delete();
    }
}
