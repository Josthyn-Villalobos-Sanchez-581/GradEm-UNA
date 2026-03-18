<?php

namespace App\Http\Controllers;

use App\Services\InscripcionCursoServices\InscripcionCursoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        } catch (\Exception $e) {
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

        return response()->json([
            'inscrito'          => $this->service->estaInscrito($idCurso, $idUsuario),
            'cupos_disponibles' => $this->service->cuposDisponibles($idCurso),
        ]);
    }
}
