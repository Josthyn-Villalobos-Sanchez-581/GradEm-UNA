<?php

namespace App\Services\CurriculumServices;

use App\Repositories\CurriculumRepositories\CurriculumRepository;
use App\Services\ServicioPlantillaCurriculum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class CurriculumService
{
    protected $repo;

    public function __construct(CurriculumRepository $repo)
    {
        $this->repo = $repo;
    }

    public function generar($request, ServicioPlantillaCurriculum $servicio)
    {
        $data = $request->validated();

        // 1) Generar PDF y obtener ruta relativa en storage/app/public
        $rutaRel = $servicio->generarPdf($data);

        // 2) Upsert en tabla curriculum (solo los campos requeridos)
        $usuarioId = $data['usuarioId'];

        // Si ya existía un registro, eliminar el archivo anterior para evitar huérfanos
        $registroPrevio = $this->repo->findByUser($usuarioId);
        if ($registroPrevio && $registroPrevio->ruta_archivo_pdf && $registroPrevio->ruta_archivo_pdf !== $rutaRel) {
            if (Storage::disk('public')->exists($registroPrevio->ruta_archivo_pdf)) {
                Storage::disk('public')->delete($registroPrevio->ruta_archivo_pdf);
            }
        }

        $this->repo->updateOrCreate(
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

    public function create()
    {
        $usuario = Auth::user();

        // Cargar la foto de perfil si existe
        $fotoPerfil = null;
        if ($usuario->fotoPerfil) {
            $fotoPerfil = [
                'ruta_imagen' => asset('storage/' . $usuario->fotoPerfil->ruta_imagen),
            ];
        }

        $permisos = DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray();

        return inertia('Frt_FormularioGeneracionCurriculum', [
            'usuario' => [
                'id_usuario'      => $usuario->id_usuario,
                'nombre_completo' => $usuario->nombre_completo,
                'cedula'          => $usuario->cedula,
                'correo'          => $usuario->correo,
                'telefono'        => $usuario->telefono ?? '',
                'fotoPerfil'      => $fotoPerfil,
            ],
            'userPermisos' => $permisos,
        ]);
    }

    public function indexCarga()
    {
        $usuario = Auth::user();

        $curriculum = $this->repo->findByUser($usuario->id_usuario);

        $permisos = $usuario
            ? DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray()
            : [];

        $documentos = [];
        if ($curriculum) {
            $documentos[] = [
                'id_documento'    => $curriculum->id,
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

    public function uploadApi($request)
    {
        $request->validate([
            'curriculum' => 'required|mimes:pdf|max:2048',
        ]);

        $usuario = Auth::user();

        DB::beginTransaction();
        try {
            // Eliminar archivo anterior si existía
            $registroPrevio = $this->repo->findByUser($usuario->id_usuario);
            if ($registroPrevio && $registroPrevio->ruta_archivo_pdf) {
                if (Storage::disk('public')->exists($registroPrevio->ruta_archivo_pdf)) {
                    Storage::disk('public')->delete($registroPrevio->ruta_archivo_pdf);
                }
                $registroPrevio->delete();
            }

            // Guardar nuevo archivo
            $file = $request->file('curriculum');
            $nombreOriginal = $file->getClientOriginalName();
            $nombreSeguro = $usuario->id_usuario . '_' . time() . '_' . Str::random(6) . '.pdf';
            $path = $file->storeAs('CurriculumCargado', $nombreSeguro, 'public');

            // Crear nuevo registro
            $this->repo->create([
                'id_usuario'       => $usuario->id_usuario,
                'generado_sistema' => 0,
                'ruta_archivo_pdf' => $path,
                'nombre_original'  => $nombreOriginal,
                'fecha_creacion'   => Carbon::now('America/Costa_Rica'),
            ]);

            DB::commit();

            return response()->json([
                'ok' => true,
                'mensaje' => "Currículum '{$nombreOriginal}' cargado con éxito.",
                'rutaPublica' => asset('storage/' . $path),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'ok' => false,
                'mensaje' => 'Error al cargar el currículum.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($request)
    {
        $usuario = Auth::user();
        $curriculum = $this->repo->findByUser($usuario->id_usuario);

        if ($curriculum) {
            if ($curriculum->ruta_archivo_pdf && Storage::disk('public')->exists($curriculum->ruta_archivo_pdf)) {
                Storage::disk('public')->delete($curriculum->ruta_archivo_pdf);
            }
            $this->repo->deleteRecord($curriculum);

            return response()->json(['ok' => true, 'mensaje' => 'Currículum eliminado correctamente.']);
        }

        return response()->json(['ok' => false, 'mensaje' => 'No se encontró el currículum.'], 404);
    }

    public function verMiCurriculum()
    {
        $usuario = Auth::user();
        $curriculum = $usuario->curriculum;

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
        $curriculum = $usuario->curriculum;

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
