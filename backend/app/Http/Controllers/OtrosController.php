<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DocumentoAdjunto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OtrosController extends Controller
{
    /**
     * Muestra la vista de carga de otros documentos.
     */
    public function indexCarga()
    {
        $user = Auth::user();

        // Obtener documentos asociados al usuario y tipo 'otros'
        $documentos = DocumentoAdjunto::where('id_usuario', $user->id_usuario)
            ->where('tipo', 'otros')
            ->get();

        return Inertia::render('OtrosCargados/Index', [
            'documentos' => $documentos,
            'userPermisos' => session('userPermisos') ?? [],
        ]);
    }

    /**
     * Sube uno o varios archivos "otros".
     */
    public function upload(Request $request)
    {
        $request->validate([
            'archivos' => 'required|array',
            'archivos.*' => 'file|mimes:pdf,png,jpg,jpeg,doc,docx,zip,rar,txt|max:5120', // 5 MB
        ]);

        $user = Auth::user();

        foreach ($request->file('archivos') as $archivo) {
            $path = $archivo->store('otros', 'public');

            DocumentoAdjunto::create([
                'id_usuario' => $user->id_usuario,
                'ruta_archivo' => $path,
                'nombre_original' => $archivo->getClientOriginalName(),
                'tipo' => 'otros',
                'fecha_subida' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Archivos cargados correctamente.');
    }

    /**
     * Elimina un documento del almacenamiento y base de datos.
     */
    public function delete(Request $request)
    {
        $request->validate([
            'id_documento' => 'required|integer|exists:documentos_adjuntos,id_documento',
        ]);

        $documento = DocumentoAdjunto::find($request->id_documento);

        if (!$documento) {
            return back()->withErrors(['error' => 'El documento no existe.']);
        }

        // Verificar que pertenece al usuario autenticado
        if ($documento->id_usuario !== Auth::id()) {
            return back()->withErrors(['error' => 'No tiene permisos para eliminar este documento.']);
        }

        // Eliminar archivo del almacenamiento
        if (Storage::disk('public')->exists($documento->ruta_archivo)) {
            Storage::disk('public')->delete($documento->ruta_archivo);
        }

        $documento->delete();

        return redirect()->back()->with('success', 'Archivo eliminado correctamente.');
    }
}
