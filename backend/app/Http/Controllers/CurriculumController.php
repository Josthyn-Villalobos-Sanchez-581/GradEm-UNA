<?php

namespace App\Http\Controllers;

use App\Http\Requests\Curriculum\GenerarCurriculumRequest;
use App\Services\ServicioPlantillaCurriculum;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CurriculumController extends Controller
{
    public function generar(GenerarCurriculumRequest $request, ServicioPlantillaCurriculum $servicio)
    {
        $data = $request->validated();

        $rutaRel = $servicio->generarPdf($data);

        return response()->json([
            'ok'          => true,
            'rutaPublica' => asset('storage/' . $rutaRel),
            'mensaje'     => 'Currículum generado correctamente.',
        ]);
    }



    //Index para la carga de documentos
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
            'userPermisos' => $permisos, // 👈 ahora sí se pasa al layout
        ]);
    }

    
    //es una funcion que agregue para cargar el curriculum del usuario ya creado
    public function upload(Request $request)
    {
        $request->validate([
            'curriculum' => 'required|mimes:pdf|max:10240', // PDF máx. 10MB
        ]);

        $usuario = Auth::user();

        // Verificar si ya existe
        $curriculumExistente = Curriculum::where('id_usuario', $usuario->id_usuario)->first();

        if ($curriculumExistente) {
            // Borrar archivo viejo si existe
            if ($curriculumExistente->ruta_archivo_pdf && Storage::disk('public')->exists($curriculumExistente->ruta_archivo_pdf)) {
                Storage::disk('public')->delete($curriculumExistente->ruta_archivo_pdf);
            }
            $curriculumExistente->delete();
        }

        // Guardar nuevo
        $path = $request->file('curriculum')->storeAs(
            'CurriculumCargado',
            $usuario->id_usuario . '_' . time() . '.pdf',
            'public'
        );

        Curriculum::create([
            'id_usuario' => $usuario->id_usuario,
            'generado_sistema' => 0,
            'ruta_archivo_pdf' => $path,
            'fecha_creacion' => now(),
        ]);

        return redirect()->back()->with('success', 'Currículum cargado con éxito');
    }

    //funcion para eliminar el curriculum cargado por el usuario
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
