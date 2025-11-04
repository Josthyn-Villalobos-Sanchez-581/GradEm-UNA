<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DocumentoAdjunto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TitulosController extends Controller
{
    /**
     * Muestra la vista con los títulos ya cargados por el usuario.
     */
    public function indexCarga()
    {
        $user = Auth::user();

        $documentos = DocumentoAdjunto::where('id_usuario', $user->id_usuario)
            ->where('tipo', 'titulo')
            ->orderByDesc('fecha_subida')
            ->get();
   Log::info('Documentos: ', $documentos->toArray());
    Log::info('User Permisos: ', getUserPermisos());
        // Pasamos documentos y permisos al componente Inertia
        return Inertia::render('TitulosCargados/Index', [
            'documentos'   => $documentos,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    /**
     * Subida múltiple de archivos (PDF / PNG / JPG), cada uno <= 2MB.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'archivos'   => 'required|array',
            'archivos.*' => 'required|mimes:pdf|max:2048', // 2MB por archivo
        ]);

        $user = Auth::user();
        $guardados = [];

        DB::beginTransaction();
        try {
            foreach ($request->file('archivos') as $file) {
                $filename = $user->id_usuario . '_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('titulos', $filename, 'public');

                $doc = DocumentoAdjunto::create([
                    'id_usuario'   => $user->id_usuario,
                    'tipo'         => 'titulo',
                    'ruta_archivo' => $path,
                    'nombre_original'  => $file->getClientOriginalName(),
                    'fecha_subida' => Carbon::now('America/Costa_Rica'),
                    // fecha_subida se maneja por default en DB
                ]);

                $guardados[] = $doc;
            }
            DB::commit();
            return redirect()->back()->with('success', count($guardados) . ' título(s) cargado(s) correctamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            // eliminar archivos escritos si hubo alguno
            foreach ($guardados as $g) {
                if (isset($g->ruta_archivo) && Storage::disk('public')->exists($g->ruta_archivo)) {
                    Storage::disk('public')->delete($g->ruta_archivo);
                }
            }
            return redirect()->back()->withErrors('Ocurrió un error al cargar los títulos. Intente nuevamente.');
        }
    }

    /**
     * Elimina un título (archivo físico + registro en DB).
     */
    public function delete(Request $request)
    {
        $request->validate([
            'id_documento' => 'required|integer',
        ]);

        $user = Auth::user();

        $doc = DocumentoAdjunto::where('id_documento', $request->id_documento)
            ->where('id_usuario', $user->id_usuario)
            ->where('tipo', 'titulo')
            ->first();

        if (! $doc) {
            return redirect()->back()->withErrors('Documento no encontrado.');
        }

        if ($doc->ruta_archivo && Storage::disk('public')->exists($doc->ruta_archivo)) {
            Storage::disk('public')->delete($doc->ruta_archivo);
        }

        $doc->delete();

        return redirect()->back()->with('success', 'Título eliminado correctamente.');
    }
}
