<?php

namespace App\Http\Controllers;

use App\Http\Requests\Curriculum\GenerarCurriculumRequest;
use App\Services\ServicioPlantillaCurriculum;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;


class CurriculumController extends Controller
{
    /**
     * Genera el PDF del currículum y guarda/actualiza el registro en la tabla `curriculum`
     * con generado_sistema = 1 (upsert por id_usuario).
     */
    public function generar(GenerarCurriculumRequest $request, ServicioPlantillaCurriculum $servicio)
    {
        $data = $request->validated();

        // 1) Generar PDF y obtener ruta relativa en storage/app/public
        $rutaRel = $servicio->generarPdf($data);

        // 2) Upsert en tabla curriculum (solo los campos requeridos)
        $usuarioId = $data['usuarioId'];

        // Si ya existía un registro, eliminar el archivo anterior para evitar huérfanos
        $registroPrevio = Curriculum::where('id_usuario', $usuarioId)->first();
        if ($registroPrevio && $registroPrevio->ruta_archivo_pdf && $registroPrevio->ruta_archivo_pdf !== $rutaRel) {
            if (Storage::disk('public')->exists($registroPrevio->ruta_archivo_pdf)) {
                Storage::disk('public')->delete($registroPrevio->ruta_archivo_pdf);
            }
        }

        Curriculum::updateOrCreate(
            ['id_usuario' => $usuarioId],
            [
                'generado_sistema' => 1,
                'ruta_archivo_pdf' => $rutaRel,
                'fecha_creacion'   => Carbon::now('America/Costa_Rica'),
            ]
        );

        // 3) Responder al frontend
        return response()->json([
            'ok'          => true,
            'rutaPublica' => asset('storage/' . $rutaRel),
            'mensaje'     => 'Currículum generado correctamente.',
        ]);
    }

    // Index para la carga de documentos
    public function indexCarga()
    {
        $usuario = Auth::user();

        $curriculum = Curriculum::where('id_usuario', $usuario->id_usuario)->first();

        $permisos = $usuario
            ? DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray()
            : [];

        $documentos = [];
        if ($curriculum) {
            $documentos[] = [
                'id_documento'    => $curriculum->id,               // alias para frontend
                'ruta_archivo'    => $curriculum->ruta_archivo_pdf,
                'nombre_original' => $curriculum->nombre_original,
                'fecha_subida'    => $curriculum->fecha_creacion,
            ];
        }

        return inertia('CurriculumCargado/Index', [
            'documentos'   => $documentos,
            'userPermisos' => $permisos,
        ]);
    }

    /**
     * Carga manual de un PDF de currículum y guarda/actualiza en `curriculum`
     * con generado_sistema = 0 (upsert por id_usuario).
     */
    public function upload(Request $request)
    {
        $request->validate([
            'curriculum' => 'required|mimes:pdf|max:2048',
        ]);
        $usuario = Auth::user();

        DB::beginTransaction();
        try {
            // ✅ Eliminar cualquier registro anterior (ya sea cargado o generado)
            $registroPrevio = Curriculum::where('id_usuario', $usuario->id_usuario)->first();

            if ($registroPrevio && $registroPrevio->ruta_archivo_pdf) {
                if (Storage::disk('public')->exists($registroPrevio->ruta_archivo_pdf)) {
                    Storage::disk('public')->delete($registroPrevio->ruta_archivo_pdf);
                }
                $registroPrevio->delete();
            }

            // ✅ Guardar nuevo archivo
            $file = $request->file('curriculum');
            $nombreOriginal = $file->getClientOriginalName();
            $nombreSeguro = $usuario->id_usuario . '_' . time() . '_' . Str::random(6) . '.pdf';
            $path = $file->storeAs('CurriculumCargado', $nombreSeguro, 'public');

            // ✅ Crear nuevo registro con nombre original
            Curriculum::create([
                'id_usuario'       => $usuario->id_usuario,
                'generado_sistema' => 0,
                'ruta_archivo_pdf' => $path,
                'nombre_original'  => $nombreOriginal, // 👈 agregado
                'fecha_creacion'   => Carbon::now('America/Costa_Rica'),
            ]);

            DB::commit();
            return redirect()->back()->with('success', "Currículum '{$nombreOriginal}' cargado con éxito.");
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->withErrors('Error al cargar el currículum.');
        }
    }


    // Elimina el currículum del usuario (registro y archivo físico)
    public function delete()
    {
        $usuario = Auth::user();
        $curriculum = Curriculum::where('id_usuario', $usuario->id_usuario)->first();

        if ($curriculum) {
            if ($curriculum->ruta_archivo_pdf && Storage::disk('public')->exists($curriculum->ruta_archivo_pdf)) {
                Storage::disk('public')->delete($curriculum->ruta_archivo_pdf);
            }
            $curriculum->delete();
        }

        return redirect()->back()->with('success', 'Currículum eliminado correctamente');
    }

    public function verMiCurriculum()
    {
        $usuario = Auth::user();
        $curriculum = $usuario->curriculum; // relación uno a uno

        if (!$curriculum || !$curriculum->ruta_archivo_pdf) {
            return response()->json(['error' => 'No se encontró el currículum'], 404);
        }

        $path = $curriculum->ruta_archivo_pdf;

        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['error' => 'Archivo no disponible'], 404);
        }

        return response()->file(storage_path("app/public/" . $path));
    }

    public function vistaVerCurriculum()
    {
        $usuario = Auth::user();
        $curriculum = $usuario->curriculum; // relación uno a uno

        $permisos = $usuario
            ? DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray()
            : [];

        if (!$curriculum || !$curriculum->ruta_archivo_pdf) {
            return inertia('Curriculum/VerCurriculum', [
                'userPermisos' => $permisos,
                'curriculum'   => null,
            ]);
        }

        $rutaPublica = asset('storage/' . $curriculum->ruta_archivo_pdf);

        return inertia('Curriculum/VerCurriculum', [
            'userPermisos' => $permisos,
            'curriculum'   => [
                'rutaPublica' => $rutaPublica,
            ],
        ]);
    }

    public function obtenerAdjuntos()
    {
        $usuario = Auth::user();

        $adjuntos = DB::table('documentos_adjuntos')
            ->where('id_usuario', $usuario->id_usuario)
            ->select(
                'id_documento',
                'tipo',
                'ruta_archivo',
                'nombre_original',
                'fecha_subida'
            )
            ->orderBy('fecha_subida', 'desc')
            ->get()
            ->map(function ($doc) {
                $doc->rutaPublica = asset('storage/' . $doc->ruta_archivo);
                return $doc;
            });

        return response()->json($adjuntos);
    }
}
