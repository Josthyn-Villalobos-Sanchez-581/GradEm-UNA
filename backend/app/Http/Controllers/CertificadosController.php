<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DocumentoAdjunto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CertificadosController extends Controller
{
    public function indexCarga()
    {
        $user = Auth::user();

        $documentos = DocumentoAdjunto::where('id_usuario', $user->id_usuario)
            ->where('tipo', 'certificado')
            ->orderByDesc('fecha_subida')
            ->get();
        return Inertia::render('CertificadosCargados/Index', [
            'documentos'   => $documentos,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'archivos'   => 'required|array',
            'archivos.*' => 'required|mimes:pdf|max:2048', // 2MB
        ]);

        $user = Auth::user();
        $guardados = [];

        DB::beginTransaction();
        try {
            foreach ($request->file('archivos') as $file) {
                $filename = $user->id_usuario . '_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('certificados', $filename, 'public');

                $doc = DocumentoAdjunto::create([
                    'id_usuario'   => $user->id_usuario,
                    'tipo'         => 'certificado',
                    'ruta_archivo' => $path,
                    'nombre_original'  => $file->getClientOriginalName(),
                    'fecha_subida' => Carbon::now('America/Costa_Rica'),
                ]);

                $guardados[] = $doc;
            }
            DB::commit();
            return redirect()->back()->with('success', count($guardados) . ' certificado(s) cargado(s) correctamente.');
        } catch (\Throwable $e) {
            DB::rollBack();
            foreach ($guardados as $g) {
                if (isset($g->ruta_archivo) && Storage::disk('public')->exists($g->ruta_archivo)) {
                    Storage::disk('public')->delete($g->ruta_archivo);
                }
            }
            return redirect()->back()->withErrors('Ocurrió un error al cargar los certificados. Intente nuevamente.');
        }
    }

    public function delete(Request $request)
    {
        $request->validate([
            'id_documento' => 'required|integer',
        ]);

        $user = Auth::user();

        $doc = DocumentoAdjunto::where('id_documento', $request->id_documento)
            ->where('id_usuario', $user->id_usuario)
            ->where('tipo', 'certificado')
            ->first();

        if (! $doc) {
            return redirect()->back()->withErrors('Documento no encontrado.');
        }

        if ($doc->ruta_archivo && Storage::disk('public')->exists($doc->ruta_archivo)) {
            Storage::disk('public')->delete($doc->ruta_archivo);
        }

        $doc->delete();

        return redirect()->back()->with('success', 'Certificado eliminado correctamente.');
    }
}
