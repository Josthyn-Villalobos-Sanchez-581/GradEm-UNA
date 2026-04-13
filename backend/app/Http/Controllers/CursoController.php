<?php

namespace App\Http\Controllers;

use App\Services\CursoServices\CursoService;
use App\Exceptions\CursoNoEncontradoException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CursoController extends Controller
{
    protected CursoService $service;

    public function __construct(CursoService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {

        $usuario = Auth::user();

        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        // IDs de cursos en los que el usuario ya está inscrito
        $misInscripciones = $usuario
            ? DB::table('inscripciones_curso')
                ->where('id_usuario', $usuario->id_usuario)
                ->pluck('id_curso')
                ->toArray()
            : [];

        // Cantidad de inscritos por curso (para mostrar cupos disponibles)
        $inscritosCount = DB::table('inscripciones_curso')
            ->select('id_curso', DB::raw('COUNT(*) as total'))
            ->groupBy('id_curso')
            ->pluck('total', 'id_curso')
            ->toArray();

        return Inertia::render('Cursos/Index', [
            'cursos' => $this->service->obtenerCursosFiltrados(
                $request,
                $usuario
            ),
            'modalidades'      => $this->service->obtenerModalidades(),
            'userPermisos'     => $permisos,
            'misInscripciones' => $misInscripciones,
            'inscritosCount'   => $inscritosCount,
            'filtros' => $request->only([
                'modalidad',
                'estado',
                'instructor',
                'fecha_inicio',
                'fecha_fin'
            ]),
        ]);
    }

    public function inscritos(int $idCurso)
    {
        $curso = $this->service->obtenerCursoPorId($idCurso);

        if (!$curso) {
            abort(404, 'Curso no encontrado');
        }

        $usuario = Auth::user();

        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        $inscritos = $this->service->obtenerInscritosCurso($idCurso);

        return Inertia::render('Cursos/GestionInscritos', [
            'curso' => $curso->load('modalidad'),
            'inscritos' => $inscritos,
            'inscritosCount' => $inscritos->count(),
            'userPermisos' => $permisos,
        ]);
    }

    public function exportarInscritosPdf(int $idCurso)
    {
        try {
            return $this->service->generarPdfInscritosCurso($idCurso);
        } catch (CursoNoEncontradoException $e) {
            abort(404, $e->getMessage());
        } catch (\Throwable $e) {

            Log::error('Error al generar PDF de inscritos', [
                'id_curso' => $idCurso,
                'error' => $e->getMessage(),
            ]);

            abort(500, 'No se pudo generar el PDF de inscritos.');
        }
    }

    public function store(Request $request)
    {
        $anioAnterior = now()->subYear()->year;
        $anioSiguiente = now()->addYear()->year;

        $request->validate([
            'titulo' => [
                'nullable',
                'string',
                'min:5',
                'max:100',
                'regex:/[a-zA-Z]/',
            ],
            'descripcion' => [
                'nullable',
                'string',
                'min:10',
                'max:300',
                'regex:/[a-zA-Z]/',
            ],
            'nombreInstructor' => [
                'nullable',
                'string',
                'min:3',
                'max:100',
                'regex:/[a-zA-Z]/',
            ],
            'duracion' => [
                'nullable',
                'string',
                'max:20',
            ],
            'cupos' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'id_modalidad' => [
                'nullable',
                'integer',
                'exists:modalidades,id_modalidad',
            ],
            'fecha_inicio' => [
                'nullable',
                'date',
            ],
            'fecha_fin' => [
                'nullable',
                'date',
                'after_or_equal:fecha_inicio',
            ],
            'fecha_limite_inscripcion' => [
                'nullable',
                'date',
                'before_or_equal:fecha_inicio',
            ],
        ]);

        $curso = $this->service->registrarCurso($request);

        return response()->json([
            'success' => true,
            'message' => 'Curso registrado correctamente',
            'curso' => $curso,
        ]);
    }

    public function publicar(int $idCurso)
    {
        try {
            $this->service->publicarCurso($idCurso);

            return response()->json([
                'success' => true,
                'message' => 'El curso ha sido publicado con éxito',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function update(Request $request, int $idCurso)
    {
        $curso = $this->service->obtenerCursoPorId($idCurso);

        if (!$curso) {
            abort(404, 'Curso no encontrado');
        }

        $reglasBase = [
            'titulo' => ['nullable', 'string', 'min:5', 'max:100', 'regex:/[a-zA-Z]/'],
            'descripcion' => ['nullable', 'string', 'min:10', 'max:300', 'regex:/[a-zA-Z]/'],
            'nombreInstructor' => ['nullable', 'string', 'min:3', 'max:100', 'regex:/[a-zA-Z]/'],
            'duracion' => ['nullable', 'string', 'max:20'],
            'cupos' => ['nullable', 'integer', 'min:1'],
            'id_modalidad' => ['nullable', 'integer', 'exists:modalidades,id_modalidad'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'fecha_limite_inscripcion' => ['nullable', 'date', 'before_or_equal:fecha_inicio'],
        ];

        // 🔒 Si está PUBLICADO → campos obligatorios
        if ($curso->estado_id === 1) {
            $reglasBase['titulo'][0] = 'required';
            $reglasBase['descripcion'][0] = 'required';
            $reglasBase['nombreInstructor'][0] = 'required';
            $reglasBase['id_modalidad'][0] = 'required';
            $reglasBase['fecha_inicio'][0] = 'required';
            $reglasBase['fecha_limite_inscripcion'][0] = 'required';
        }

        $request->validate($reglasBase);

        $this->service->actualizarCurso($request, $idCurso);

        return response()->json([
            'success' => true,
            'message' => 'El curso fue actualizado correctamente',
        ]);
    }

    public function destroy(Request $request, int $idCurso)
    {
        $request->validate([
            'motivo' => 'required|min:10',
        ]);

        $motivo = $request->input('motivo'); // ✅ EXTRAER EL MOTIVO

        $this->service->eliminarCurso($idCurso, $motivo); // ✅ PASARLO

        return response()->json([
            'success' => true,
            'message' => 'El curso fue eliminado con éxito',
        ]);
    }
}