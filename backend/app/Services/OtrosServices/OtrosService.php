<?php

namespace App\Services\OtrosServices;

use App\Repositories\OtrosRepositories\OtrosRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class OtrosService
{
    protected $repo;

    public function __construct(OtrosRepository $repo)
    {
        $this->repo = $repo;
    }

    public function indexCarga()
    {
        $user = Auth::user();
        $documentos = $this->repo->getDocumentosByUser($user->id_usuario);

        return Inertia::render('OtrosCargados/Index', [
            'documentos'   => $documentos,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'archivos'   => 'required|array',
            'archivos.*' => 'required|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = Auth::user();
        $guardados = [];

        DB::beginTransaction();
        try {
            foreach ($request->file('archivos') as $file) {
                $filename = $user->id_usuario . '_' . time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('otros', $filename, 'public');

                $doc = $this->repo->createDocumento([
                    'id_usuario'      => $user->id_usuario,
                    'tipo'            => 'otro',
                    'ruta_archivo'    => $path,
                    'nombre_original' => $file->getClientOriginalName(),
                    'fecha_subida'    => Carbon::now('America/Costa_Rica'),
                ]);

                $guardados[] = $doc;
            }

            DB::commit();
            return redirect()->back()->with('success', count($guardados) . ' documento(s) cargado(s) correctamente.');
        } catch (\Throwable $e) {
            DB::rollBack();

            foreach ($guardados as $g) {
                if (isset($g->ruta_archivo) && Storage::disk('public')->exists($g->ruta_archivo)) {
                    Storage::disk('public')->delete($g->ruta_archivo);
                }
            }

            return redirect()->back()->withErrors('Ocurrió un error al cargar los documentos.');
        }
    }

    public function delete(Request $request)
    {
        $request->validate([
            'id_documento' => 'required|integer',
        ]);

        $user = Auth::user();
        $doc = $this->repo->findDocumentoByIdAndUser($request->id_documento, $user->id_usuario);

        if (! $doc) {
            return redirect()->back()->withErrors('Documento no encontrado.');
        }

        if ($doc->ruta_archivo) {
            $this->repo->deleteStorageFile($doc->ruta_archivo);
        }

        $this->repo->deleteDocumentoModel($doc);

        return redirect()->back()->with('success', 'Documento eliminado correctamente.');
    }
}
