<?php

namespace App\Http\Controllers;

use App\Http\Requests\Curriculum\GenerarCurriculumRequest;
use App\Services\ServicioPlantillaCurriculum;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
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

        // Obtener permisos del usuario autenticado para PpLayout
        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        return inertia('CurriculumCargado/Index', [
            'usuario'      => $usuario,
            'curriculum'   => $curriculum,
            'userPermisos' => $permisos, // pasa permisos al layout
        ]);
    }

    /**
     * Carga manual de un PDF de currículum y guarda/actualiza en `curriculum`
     * con generado_sistema = 0 (upsert por id_usuario).
     */
    public function upload(Request $request)
    {
        $request->validate([
            'curriculum' => 'required|mimes:pdf|max:10240', // PDF máx. 10MB
        ]);

        $usuario = Auth::user();

        // Guardar archivo nuevo
        $path = $request->file('curriculum')->storeAs(
            'CurriculumCargado',
            $usuario->id_usuario . '_' . time() . '.pdf',
            'public'
        );

        // Si ya existía registro, eliminar archivo anterior para no dejar huérfanos
        $registroPrevio = Curriculum::where('id_usuario', $usuario->id_usuario)->first();
        if ($registroPrevio && $registroPrevio->ruta_archivo_pdf && $registroPrevio->ruta_archivo_pdf !== $path) {
            if (Storage::disk('public')->exists($registroPrevio->ruta_archivo_pdf)) {
                Storage::disk('public')->delete($registroPrevio->ruta_archivo_pdf);
            }
        }

        // Upsert con generado_sistema = 0
        Curriculum::updateOrCreate(
            ['id_usuario' => $usuario->id_usuario],
            [
                'generado_sistema' => 0,
                'ruta_archivo_pdf' => $path,
                'fecha_creacion' => Carbon::now('America/Costa_Rica'),
            ]
        );

        return redirect()->back()->with('success', 'Currículum cargado con éxito');
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
}
