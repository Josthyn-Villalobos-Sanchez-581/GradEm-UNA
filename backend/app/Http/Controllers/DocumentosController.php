<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\DocumentoAdjunto;
use Illuminate\Http\Request;

class DocumentosController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        // Obtener permisos
        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        return Inertia::render('Documentos/Index', [
            'userPermisos' => $permisos,
        ]);
    }

    public function obtenerAdjuntos($id)
    {
        try {
            $adjuntos = DocumentoAdjunto::where('id_usuario', $id)
                ->select('id_documento', 'nombre_original', 'ruta_archivo', 'fecha_subida', 'tipo')
                ->orderBy('fecha_subida', 'desc')
                ->get()
                ->map(function ($doc) {
                    $doc->rutaPublica = asset('storage/' . ltrim($doc->ruta_archivo, '/'));
                    return $doc;
                });

            return response()->json($adjuntos);
        } catch (\Throwable $e) {
            \Log::error('Error al obtener documentos adjuntos', [
                'usuario_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Error interno al obtener adjuntos'], 500);
        }
    }
}
