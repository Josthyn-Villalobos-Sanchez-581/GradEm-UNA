<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DocumentoAdjunto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OtrosController extends Controller
{
    /**
     * Muestra la vista de carga de otros documentos.
     */
    public function indexCarga()
    {
        $user = Auth::user();

        $documentos = DocumentoAdjunto::where('id_usuario', $user->id_usuario)
            ->where('tipo', 'otro') // ✅ coherente con 'titulo' y 'certificado'
            ->orderByDesc('fecha_subida')
            ->get();

        return Inertia::render('OtrosCargados/Index', [
            'documentos'   => $documentos,
            'userPermisos' => getUserPermisos(), // ✅ así sí se renderiza el topbar
        ]);
    }

    /**
     * Sube uno o varios archivos "otros".
     */
    public function upload(Request $request)
    {
        $request->validate([
            'archivos'   => 'required|array',
            'archivos.*' => 'file|mimes:pdf|max:5120', // 5 MB
        ]);

        $user = Auth::user();

        foreach ($request->file('archivos') as $archivo) {
            $path = $archivo->store('otros', 'public');

            DocumentoAdjunto::create([
                'id_usuario'       => $user->id_usuario,
                'ruta_archivo'     => $path,
                'nombre_original'  => $archivo->getClientOriginalName(),
                'tipo'             => 'otro', // ✅ coherente
                'fecha_subida' => Carbon::now('America/Costa_Rica'),
            ]);
        }

        return redirect()->back()->with('success', 'Archivo(s) cargado(s) correctamente.');
    }

    /**
     * Elimina un documento del almacenamiento y base de datos.
     */
    public function delete(Request $request)
    {
        $request->validate([
            'id_documento' => 'required|integer|exists:documentos_adjuntos,id_documento',
        ]);

        $user = Auth::user();

        $documento = DocumentoAdjunto::where('id_documento', $request->id_documento)
            ->where('id_usuario', $user->id_usuario)
            ->where('tipo', 'otro')
            ->first();

        if (! $documento) {
            return back()->withErrors(['error' => 'El documento no existe o no pertenece a este usuario.']);
        }

        if (Storage::disk('public')->exists($documento->ruta_archivo)) {
            Storage::disk('public')->delete($documento->ruta_archivo);
        }

        $documento->delete();

        return redirect()->back()->with('success', 'Archivo eliminado correctamente.');
    }
}
