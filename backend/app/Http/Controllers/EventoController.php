<?php

namespace App\Http\Controllers;

use App\Services\EventoServices\EventoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class EventoController extends Controller
{
    protected EventoService $service;

    public function __construct(EventoService $service)
    {
        $this->service = $service;
    }

    /**
     * Listado de eventos (HU-33 Parte 2)
     * Carga TODO desde el inicio (eventos + FK)
     */
    public function index(Request $request)
    {
        $this->service->finalizarEventosAutomaticamente();
        
        $usuario = Auth::user();

        // Permisos del usuario
        $permisos = $usuario
            ? DB::table('roles_permisos')
            ->where('id_rol', $usuario->id_rol)
            ->pluck('id_permiso')
            ->toArray()
            : [];

        return Inertia::render('Eventos/Index', [
            'eventos' => $this->service->obtenerEventosFiltrados(
                $request,
                $usuario
            ),

            // FK necesarias para frontend
            'modalidades' => $this->service->obtenerModalidades(),
            'ubicaciones' => $this->service->obtenerUbicaciones(),
            'paises' => $this->service->obtenerPaises(),
            'carreras' => $this->service->obtenerCarreras(),
            'roles' => $this->service->obtenerRolesInteresados(),

            'userPermisos' => $permisos,

            // Para mantener filtros en frontend
            'filtros' => $request->only([
                'buscar',
                'estado',
                'fecha_inicio',
                'fecha_fin'
            ]),
        ]);
    }

    /**
     * 📌 Registrar evento
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => ['required', 'string', 'min:5', 'max:100', 'regex:/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúñ.,;:()\"\'¡!¿?%&@\/\-\s]+$/u'],
            'descripcion' => ['required', 'string', 'min:10', 'max:500', 'regex:/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúñ.,;:()\"\'¡!¿?%&@\/\-\s]+$/u'],
            'fecha_evento' => ['required', 'date'],
            'fecha_limite_inscripcion' => ['nullable', 'date', 'before_or_equal:fecha_evento'],
            'hora_evento' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d(?:\:[0-5]\d)?$/'],
            'id_modalidad' => ['required', 'integer', 'exists:modalidades,id_modalidad'],
            'id_ubicacion' => ['required', 'integer', 'exists:cantones,id_canton'],
            'carreras_invitadas' => ['required', 'array', 'min:1'],
            'carreras_invitadas.*' => ['integer', 'exists:carreras,id_carrera'],
            'roles_interesados' => ['required', 'array', 'min:1'],
            'roles_interesados.*' => ['integer', Rule::in([6, 7])],
            'otras_observaciones' => ['nullable', 'string', 'min:10', 'max:500'],
            'cupos' => ['nullable', 'integer', 'min:1'],
        ]);

        $evento = $this->service->registrarEvento($request);

        return response()->json([
            'success' => true,
            'message' => 'Evento registrado correctamente',
            'evento' => $evento,
        ]);
    }

    /**
     * 📌 Actualizar evento
     */
    public function update(Request $request, int $idEvento)
    {
        $evento = $this->service->obtenerEventoSeguro($idEvento);

        $reglasBase = [
            'titulo' => ['nullable', 'string', 'min:5', 'max:100', 'regex:/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúñ.,;:\(\)"\'¡!¿?%&@\/\-\s]+$/u'],
            'descripcion' => ['nullable', 'string', 'min:10', 'max:500', 'regex:/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúñ.,;:\(\)"\'¡!¿?%&@\/\-\s]+$/u'],
            'fecha_evento' => ['nullable', 'date'],
            'fecha_limite_inscripcion' => ['nullable', 'date', 'before_or_equal:fecha_evento'],
            'hora_evento' => ['nullable', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d(?:\:[0-5]\d)?$/'],
            'id_modalidad' => ['nullable', 'integer', 'exists:modalidades,id_modalidad'],
            'id_ubicacion' => ['nullable', 'integer', 'exists:cantones,id_canton'],
            'carreras_invitadas' => ['required', 'array', 'min:1'],
            'carreras_invitadas.*' => ['integer', 'exists:carreras,id_carrera'],
            'roles_interesados' => ['required', 'array', 'min:1'],
            'roles_interesados.*' => ['required','integer','exists:roles,id_rol',Rule::in([6, 7])],
            'otras_observaciones' => ['nullable', 'string', 'min:10', 'max:500'],
            'cupos' => ['nullable', 'integer', 'min:1'],
        ];

        if ($evento->estado_id === 1) {
            $reglasBase['titulo'][0] = 'required';
            $reglasBase['descripcion'][0] = 'required';
            $reglasBase['fecha_evento'][0] = 'required';
            $reglasBase['hora_evento'][0] = 'required';
            $reglasBase['id_modalidad'][0] = 'required';
            $reglasBase['id_ubicacion'][0] = 'required';
        }

        $request->validate($reglasBase);

        $eventoActualizado = $this->service->actualizarEvento($request, $idEvento);

        return response()->json([
            'success' => true,
            'message' => 'Evento actualizado correctamente',
            'evento' => $eventoActualizado,
        ]);
    }

    /**
     * Publicar evento
     */
    public function publicar(int $idEvento)
    {
        try {
            $this->service->publicarEvento($idEvento);

            return response()->json([
                'success' => true,
                'message' => 'El evento ha sido publicado con éxito',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Inactivar evento 
     */
    public function destroy(Request $request, int $idEvento)
    {
        $request->validate([
            'motivo' => 'required|min:10',
        ]);

        try {
            $this->service->inactivarEvento(
                $idEvento,
                $request->motivo
            );

            return response()->json([
                'success' => true,
                'message' => 'Evento inactivado correctamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                // Si quieres que el error también se vea en la respuesta JSON:
                'error_detalle' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Obtener detalle de evento
     */
    public function show(int $idEvento)
    {
        try {
            $evento = $this->service->obtenerEventoCompleto($idEvento);

            return response()->json([
                'success' => true,
                'evento' => $evento,
            ]);
        } catch (\Exception $e) {
    dd($e->getMessage());
}
    }

    /**
     * Gestión de inscritos de evento
     */
    public function inscritos(int $idEvento)
    {
        $evento = $this->service->obtenerEventoCompleto($idEvento);

        if (!$evento) {
            abort(404, 'Evento no encontrado');
        }

        $usuario = Auth::user();

        $permisos = $usuario
            ? DB::table('roles_permisos')
                ->where('id_rol', $usuario->id_rol)
                ->pluck('id_permiso')
                ->toArray()
            : [];

        $inscritos = $this->service->obtenerInscritosEventoGestion($idEvento);

        return Inertia::render('Eventos/GestionInscritos', [
            'evento' => $evento,
            'inscritos' => $inscritos,
            'inscritosCount' => $inscritos->count(),
            'userPermisos' => $permisos,
        ]);
    }

    /**
     * Eliminar inscripción de evento
     */
    public function eliminarInscrito(int $idEvento, int $idUsuario)
    {
        try {
            $this->service->eliminarInscripcionEvento($idEvento, $idUsuario);

            return response()->json([
                'success' => true,
                'message' => 'Participante eliminado correctamente.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Descargar PDF de participantes o asistencia de evento
     */
    public function descargarPdf(int $idEvento, string $tipo)
    {
        return $this->service->generarPdfEvento($idEvento, $tipo);
    }

    /**
     * Enviar recordatorio a inscritos de evento
     */
    public function enviarRecordatorio(Request $request): JsonResponse
    {
        $request->validate([
            'id_evento' => 'required|integer|exists:eventos,id_evento',
            'nombre_evento' => 'required|string|max:150',
            'fecha_evento' => 'required|string|max:50',
            'mensaje' => 'required|string',
        ]);

        $enviados = $this->service->enviarRecordatorio(
            (int) $request->id_evento,
            $request->only(['nombre_evento', 'fecha_evento', 'mensaje'])
        );

        return response()->json([
            'mensaje' => 'Recordatorios enviados correctamente',
            'enviados' => $enviados,
        ]);
    }

    /**
     * API: Obtener países para cascada de ubicación
     */
    public function obtenerPaises(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->obtenerPaises(),
        ]);
    }

    /**
     * API: Obtener provincias por país
     */
    public function obtenerProvinciasPorPais(int $idPais): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->obtenerProvinciasPorPais($idPais),
        ]);
    }

    /**
     * API: Obtener cantones por provincia
     */
    public function obtenerCantonePorProvincia(int $idProvincia): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->obtenerCantonePorProvincia($idProvincia),
        ]);
    }


 /*   
// ===============================================
// INSCRIPCIONES A EVENTOS
// ===============================================

/**
 * Verificar si el usuario ya está inscrito en el evento
 *//*
public function existeInscripcion(int $idEvento, int $idUsuario): bool
{
    return DB::table('inscripciones_evento')
        ->where('id_evento', $idEvento)
        ->where('id_usuario', $idUsuario)
        ->where('estado_id', 1) // activo
        ->exists();
}
*/
/**
 * Obtener cantidad de inscritos activos por evento
 *//*
public function contarInscritos(int $idEvento): int
{
    return DB::table('inscripciones_evento')
        ->where('id_evento', $idEvento)
        ->where('estado_id', 1)
        ->count();
}
*/
/**
 * Obtener conteo de inscritos para todos los eventos
 *//*
public function obtenerInscritosCount(): array
{
    return DB::table('inscripciones_evento')
        ->select('id_evento', DB::raw('COUNT(*) as total'))
        ->where('estado_id', 1)
        ->groupBy('id_evento')
        ->pluck('total', 'id_evento')
        ->toArray();
}
*/
/**
 * Registrar inscripción
 *//*
public function crearInscripcion(int $idEvento, int $idUsuario): bool
{
    return DB::table('inscripciones_evento')->insert([
        'id_evento' => $idEvento,
        'id_usuario' => $idUsuario,
        'fecha_inscripcion' => now(),
        'estado_id' => 1 // activo
    ]);
}
*/
/**
 * Obtener inscripciones del usuario
 *//*
public function obtenerMisInscripciones(int $idUsuario): array
{
    return DB::table('inscripciones_evento')
        ->where('id_usuario', $idUsuario)
        ->where('estado_id', 1)
        ->pluck('id_evento')
        ->toArray();
}*/

/**
 * Obtener evento con cupos (para validación)
 *//*
public function obtenerEventoParaInscripcion(int $idEvento)
{
    return DB::table('eventos')
        ->where('id_evento', $idEvento)
        ->first();
}
*/
/**
 * Cancelar inscripción (cambio de estado)
 *//*
public function cancelarInscripcion(int $idEvento, int $idUsuario): bool
{
    return DB::table('inscripciones_evento')
        ->where('id_evento', $idEvento)
        ->where('id_usuario', $idUsuario)
        ->update([
            'estado_id' => 2 // cancelado
        ]) > 0;
}

*/
}
