<?php

namespace App\Http\Controllers;

use App\Services\EventoServices\InscripcionEventoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

use Inertia\Inertia;                     
use Illuminate\Support\Facades\DB;       

class InscripcionEventoController extends Controller
{
    protected InscripcionEventoService $service;


    public function __construct(InscripcionEventoService $service)
    {
        $this->service = $service;
    }

public function index(): \Inertia\Response
{
    $usuario = Auth::user();

    $permisos = DB::table('roles_permisos')
        ->where('id_rol', $usuario->id_rol)
        ->pluck('id_permiso')
        ->toArray();

 $eventos = $this->service->obtenerEventosParaInscripcion(
        $usuario->id_carrera,
        $usuario->id_rol
    );

    $misInscripciones = $this->service->obtenerMisInscripciones($usuario->id_usuario);

    return Inertia::render('Eventos/EventosInscripcionIndex', [
        'eventos'         => $eventos,
        'modalidades'     => $this->service->obtenerModalidades(),
        'misInscripciones'=> $misInscripciones,
        'userPermisos'    => $permisos,
    ]);
}

    /**
     *  Inscribirse a un evento
     */
    public function store(int $idEvento): JsonResponse
{
    try {
        $evento = $this->service->inscribirse($idEvento);

        return response()->json([
            'success' => true,
            'message' => 'Inscripción realizada correctamente',
            'evento'  => $evento // 🔥 ESTO ES CLAVE
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 422);
    }
}
    /**
     *  Cancelar inscripción
     */
    public function cancelar(int $idEvento): JsonResponse
    {
        try {
            $this->service->cancelar($idEvento);

            return response()->json([
                'success' => true,
                'message' => 'Inscripción cancelada correctamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     *  Obtener estado de inscripción (para frontend)
     */
    public function estado(int $idEvento): JsonResponse
    {
        try {
            $usuario = Auth::user();

            if (!$usuario) {
                return response()->json([
                    'inscrito' => false
                ]);
            }

            $misInscripciones = $this->service->obtenerMisInscripciones($usuario->id_usuario);

            return response()->json([
                'inscrito' => in_array($idEvento, $misInscripciones)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'inscrito' => false
            ]);
        }
    }

    /**
     *  Obtener mis eventos inscritos (opcional)
     */
    public function misEventos()  // este metodo es el que utiliza el botón "ver" en el frontend para mostrar los eventos a los que se puede escribir
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return redirect()->back();
        }

        return response()->json([
            'eventos' => $this->service->obtenerMisInscripciones($usuario->id_usuario)
        ]);
    }
  public function show(int $idEvento): JsonResponse
{
    try {
        $evento = $this->service->obtenerEventoParaInscripcionPorId($idEvento);

        return response()->json([
            'success' => true,
            'evento'  => $evento,
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 404);
    }
}
public function misEventosIndex(): \Inertia\Response
{
    $usuario = Auth::user();

    $permisos = DB::table('roles_permisos')
        ->where('id_rol', $usuario->id_rol)
        ->pluck('id_permiso')
        ->toArray();

    $eventos = $this->service->obtenerMisEventos($usuario->id_usuario);
    $modalidades = $this->service->obtenerModalidades();

    return Inertia::render('Eventos/MisEventosIndex', [
        'eventos'      => $eventos,
        'modalidades'  => $modalidades,
        'userPermisos' => $permisos,
    ]);
}
}