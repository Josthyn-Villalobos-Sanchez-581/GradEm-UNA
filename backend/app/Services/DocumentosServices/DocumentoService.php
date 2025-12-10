<?php

namespace App\Services\DocumentosServices;

use App\Repositories\DocumentosRepositories\DocumentoRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class DocumentoService
{
    protected $repo;

    public function __construct(DocumentoRepository $repo)
    {
        $this->repo = $repo;
    }

    public function indexCarga()
    {
        $user = Auth::user();
        $documentos = $this->repo->obtenerAdjuntosPorUsuario($user->id_usuario);

        return Inertia::render('Documentos/Index', [
            'documentos'   => $documentos,
            'userPermisos' => getUserPermisos(),
        ]);
    }

    public function obtenerAdjuntos()
    {
        $usuario = Auth::user();
        return response()->json($this->repo->obtenerAdjuntosPorUsuario($usuario->id_usuario));
    }

    public function uploadApi(Request $request)
    {
        $request->validate([
            'archivo' => 'required|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $usuario = Auth::user();

        DB::beginTransaction();
        try {
            $file = $request->file('archivo');
            $nombreOriginal = $file->getClientOriginalName();
            $ext = $file->getClientOriginalExtension();
            $nombreSeguro = $usuario->id_usuario . '_' . time() . '_' . Str::random(6) . '.' . $ext;
            $path = $file->storeAs('DocumentosAdjuntos', $nombreSeguro, 'public');

            DB::table('documentos_adjuntos')->insert([
                'id_usuario' => $usuario->id_usuario,
                'tipo' => $request->input('tipo', 'otro'),
                'ruta_archivo' => $path,
                'nombre_original' => $nombreOriginal,
                'fecha_subida' => Carbon::now('America/Costa_Rica'),
            ]);

            DB::commit();

            return response()->json(['ok' => true, 'mensaje' => "Archivo cargado con éxito.", 'rutaPublica' => asset('storage/' . $path)]);
        } catch (\Throwable $e) {
            DB::rollBack();
            if (isset($path) && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            return response()->json(['ok' => false, 'mensaje' => 'Error al cargar archivo.', 'error' => $e->getMessage()], 500);
        }
    }

    public function delete(Request $request)
    {
        $idDocumento = $request->input('id_documento');
        $ok = $this->repo->eliminarAdjunto($idDocumento);
        if ($ok) {
            return response()->json(['ok' => true, 'mensaje' => 'Archivo eliminado correctamente.']);
        }
        return response()->json(['ok' => false, 'mensaje' => 'No se encontró el archivo.'], 404);
    }
}
