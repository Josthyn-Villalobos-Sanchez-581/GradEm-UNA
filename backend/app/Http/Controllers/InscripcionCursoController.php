<?php

namespace App\Http\Controllers;

use App\Services\InscripcionCursoServices\InscripcionCursoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
<<<<<<< HEAD
use Inertia\Inertia;
=======
use Illuminate\Support\Facades\Log;
>>>>>>> develop

class InscripcionCursoController extends Controller
{
    protected InscripcionCursoService $service;

    public function __construct(InscripcionCursoService $service)
    {
        $this->service = $service;
    }

    /**
     * POST /cursos/{idCurso}/inscribirse
     * Inscribe al usuario autenticado en el curso indicado.
     */
    public function store(int $idCurso)
    {
        $idUsuario = Auth::id();

        if (!$idUsuario) {
            return response()->json([
                'success' => false,
                'message' => 'Su sesion expiro. Inicie sesion nuevamente.',
            ], 401);
        }

        try {
            $this->service->inscribir($idCurso, $idUsuario);

            return response()->json([
                'success' => true,
                'message' => '¡Te has inscrito correctamente al curso!',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Error al inscribir usuario en curso.', [
                'id_curso' => $idCurso,
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al procesar la inscripción. Intente nuevamente.',
            ], 500);
        }
    }

    /**
     * GET /cursos/{idCurso}/inscripcion-estado
     * Retorna si el usuario ya está inscrito y los cupos disponibles.
     */
    public function estado(int $idCurso)
    {
        $idUsuario = Auth::id();

        if (!$idUsuario) {
            return response()->json([
                'success' => false,
                'message' => 'Su sesion expiro. Inicie sesion nuevamente.',
            ], 401);
        }

        return response()->json([
            'inscrito'          => $this->service->estaInscrito($idCurso, $idUsuario),
            'cupos_disponibles' => $this->service->cuposDisponibles($idCurso),
        ]);
    }

    /**
     * DELETE /cursos/{idCurso}/cancelar
     * Cancela la inscripción del usuario autenticado en el curso.
     */
    public function cancelar(int $idCurso)
    {
        $idUsuario = Auth::id();

        try {
            $this->service->cancelar($idCurso, $idUsuario);

            return response()->json([
                'success' => true,
                'message' => 'Tu inscripción ha sido cancelada correctamente.',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al cancelar la inscripción.',
            ], 500);
        }
    }

    /**
     * GET /mis-cursos
     * Retorna los cursos inscritos del usuario
     */
    public function misCursos()
    {
        $idUsuario = Auth::id();

        return Inertia::render('Cursos/MisCursosIndex', [
            'cursos' => $this->service->obtenerMisCursos($idUsuario),
            'modalidades' => $this->service->obtenerModalidades(),
        ]);
    }
}
