<?php

namespace App\Http\Controllers;

use App\Services\NotificacionCursoServices\NotificacionCursoService;
use Illuminate\Http\Request;

class NotificacionCursoController extends Controller
{
    protected NotificacionCursoService $notificacionCursoService;

    public function __construct(NotificacionCursoService $notificacionCursoService)
    {
        $this->notificacionCursoService = $notificacionCursoService;
    }

    /**
     * Enviar correo masivo manual a inscritos de un curso
     * Solo Administradores / Coordinadores
     */
    public function enviarCorreoMasivo(Request $request)
    {
        $request->validate([
            'correos' => 'required|array|min:1',
            'correos.*' => 'email',
            'asunto' => 'required|string|max:150',
            'titulo' => 'required|string|max:150',
            'mensaje' => 'required|string',
        ]);

        $this->notificacionCursoService->enviarCorreoMasivo(
            $request->correos,
            $request->only(['asunto', 'titulo', 'mensaje'])
        );

        return response()->json([
            'mensaje' => 'Correos enviados correctamente'
        ]);
    }

    /**
     * Enviar recordatorio automático
     */
    public function enviarRecordatorio(Request $request)
    {
        $request->validate([
            'correos' => 'required|array|min:1',
            'correos.*' => 'email',
            'nombre_curso' => 'required|string|max:150',
            'fecha_evento' => 'required|string|max:50',
            'mensaje' => 'required|string',
        ]);

        $this->notificacionCursoService->enviarRecordatorio(
            $request->correos,
            $request->only(['nombre_curso', 'fecha_evento', 'mensaje'])
        );

        return response()->json([
            'mensaje' => 'Recordatorios enviados correctamente'
        ]);
    }

    /**
     * Notificar inscripción o cancelación
     */
    public function notificarCambioInscripcion(Request $request)
    {
        $request->validate([
            'correos' => 'required|array|min:1',
            'correos.*' => 'email',
            'tipo' => 'required|in:inscripcion,cancelacion',
            'nombre_curso' => 'required|string|max:150',
            'nombre_persona' => 'required|string|max:150',
        ]);

        $this->notificacionCursoService->notificarCambioInscripcion(
            $request->correos,
            $request->only(['tipo', 'nombre_curso', 'nombre_persona'])
        );

        return response()->json([
            'mensaje' => 'Notificación enviada correctamente'
        ]);
    }
}
