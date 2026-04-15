<?php

namespace App\Services\EventoServices;

use App\Mail\EventoActualizadoMail;
use App\Mail\EventoPublicadoMail;
use App\Repositories\EventoRepository\EventoRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Mail\Eventos\EventoCanceladoMail;
use App\Mail\Eventos\RecordatorioEventoMail;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;

class EventoService
{
    protected $eventoRepository;

    public function __construct(EventoRepository $eventoRepository)
    {
        $this->eventoRepository = $eventoRepository;
    }

    public function finalizarEventosAutomaticamente(){
        $this->eventoRepository->finalizarEventosAutomaticamente();
    }

    /**
     * Obtener eventos filtrados
     */
    public function obtenerEventosFiltrados($request, $usuario)
    {
        return $this->eventoRepository->filtrarEventos($request, $usuario);
    }

    /**
     * Obtener evento por ID con validación de acceso (ANTI URL MANIPULADA)
     */
    public function obtenerEventoSeguro(int $idEvento)
    {
        $evento = $this->eventoRepository->obtenerEventoPorId($idEvento);

        if (!$evento) {
            throw new \Exception('Evento no encontrado');
        }

        $usuario = Auth::user();

        //VALIDACIÓN DE ACCESO
        if (
            !in_array($usuario->id_rol, [1]) && // superadmin
            $evento->usuario_id !== $usuario->id_usuario
        ) {
            throw new \Exception('No autorizado para acceder a este evento');
        }

        return $evento;
    }

    /**
     * Obtener evento completo (para modal)
     */
    public function obtenerEventoCompleto(int $idEvento)
    {
        $evento = $this->obtenerEventoSeguro($idEvento);

        return $this->eventoRepository->obtenerEventoCompleto($evento->id_evento);
    }

    public function obtenerDestinatariosEvento(int $idEvento)
    {
        $evento = $this->eventoRepository->obtenerEventoCompleto($idEvento);

        if (!$evento) {
            return collect();
        }

        return $this->eventoRepository->obtenerUsuariosPorCarrerasYRoles(
            $evento->carreras_invitadas ?? [],
            $evento->roles_interesados ?? []
        );
    }

    public function registrarEvento($request)
    {
        DB::beginTransaction();

        try {
            $usuario = Auth::user();

            $data = [
                'titulo' => $request->titulo ?? null,
                'descripcion' => $request->descripcion ?? null,
                'fecha_evento' => $request->fecha_evento ?? null,
                'hora_evento' => $request->hora_evento ?? null,
                'id_modalidad' => $request->id_modalidad ?? null,
                'id_ubicacion' => $request->id_ubicacion ?? null,
                'otras_observaciones' => $request->otras_observaciones ?? null,
                'estado_id' => 7,//7 es borrador
                'usuario_id' => $usuario?->id_usuario,
            ];

            $evento = $this->eventoRepository->crearEvento($data);

            if ($request->carreras_invitadas) {
                $this->eventoRepository->sincronizarCarrerasEvento($evento->id_evento, $request->carreras_invitadas);
            }

            if ($request->roles_interesados) {
                $this->eventoRepository->sincronizarRolesEvento($evento->id_evento, $request->roles_interesados);
            }

            DB::commit();

            return $this->eventoRepository->obtenerEventoCompleto($evento->id_evento);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function actualizarEvento($request, int $idEvento)
    {
        DB::beginTransaction();

        try {
            $evento = $this->obtenerEventoSeguro($idEvento);
            $eventoCompleto = $this->eventoRepository->obtenerEventoCompleto($idEvento);

            $datosOriginales = [
                'titulo' => $evento->titulo,
                'descripcion' => $evento->descripcion,
                'fecha_evento' => $evento->fecha_evento,
                'hora_evento' => $evento->hora_evento,
                'id_modalidad' => $evento->id_modalidad,
                'id_ubicacion' => $evento->id_ubicacion,
                'otras_observaciones' => $evento->otras_observaciones,
            ];

            $data = [
                'titulo' => $request->titulo,
                'descripcion' => $request->descripcion,
                'fecha_evento' => $request->fecha_evento,
                'hora_evento' => $request->hora_evento,
                'id_modalidad' => $request->id_modalidad,
                'id_ubicacion' => $request->id_ubicacion,
                'otras_observaciones' => $request->otras_observaciones ?? null,
            ];

            $cambiosCriticos = [];
            foreach ($datosOriginales as $campo => $valorOriginal) {

                $valorNuevo = $data[$campo] ?? null;

                // 🔥 Normalización por tipo de campo
                switch ($campo) {

                    case 'fecha_evento':
                        $valorOriginal = $valorOriginal ? date('Y-m-d', strtotime($valorOriginal)) : null;
                        $valorNuevo = $valorNuevo ? date('Y-m-d', strtotime($valorNuevo)) : null;
                        break;

                    case 'hora_evento':
                        $valorOriginal = $valorOriginal ? substr($valorOriginal, 0, 5) : null;
                        $valorNuevo = $valorNuevo ? substr($valorNuevo, 0, 5) : null;
                        break;

                    case 'id_modalidad':
                    case 'id_ubicacion':
                        $valorOriginal = $valorOriginal !== null ? (int)$valorOriginal : null;
                        $valorNuevo = $valorNuevo !== null ? (int)$valorNuevo : null;
                        break;

                    default:
                        $valorOriginal = $valorOriginal !== null ? trim((string)$valorOriginal) : null;
                        $valorNuevo = $valorNuevo !== null ? trim((string)$valorNuevo) : null;
                        break;
                }

                // 🔥 Comparación REAL
                if ($valorNuevo !== $valorOriginal) {
                    $cambiosCriticos[$campo] = $valorNuevo;
                }
            }

            // No notificar por cambios en destinatarios (carreras o roles interesados).
            // Solo se envían correos cuando otros datos críticos del evento cambian.
            $this->eventoRepository->actualizarEvento($evento, $data);

            if ($request->carreras_invitadas) {
                $this->eventoRepository->sincronizarCarrerasEvento($idEvento, $request->carreras_invitadas);
            }

            if ($request->roles_interesados) {
                $this->eventoRepository->sincronizarRolesEvento($idEvento, $request->roles_interesados);
            }

            $eventoActualizado = $this->eventoRepository->obtenerEventoCompleto($idEvento);
            $destinatarios = $this->obtenerDestinatariosEvento($idEvento);

            if ($evento->estado_id === 1 && !empty($cambiosCriticos) && $destinatarios->count() > 0) {
                foreach ($destinatarios as $destinatario) {
                    Mail::to($destinatario->correo)->queue(
                        new EventoActualizadoMail($eventoActualizado, $cambiosCriticos)
                    );
                }
            }

            DB::commit();

            return $eventoActualizado;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Obtener inscritos del evento para vista de gestión
     */
    public function obtenerInscritosEventoGestion(int $idEvento)
    {
        $evento = $this->obtenerEventoSeguro($idEvento);

        return $this->eventoRepository->obtenerInscritosGestionEvento($evento->id_evento);
    }

    /**
     * Publicar evento
     */
    public function publicarEvento(int $idEvento)
    {
        DB::beginTransaction();

        try {
            $evento = $this->obtenerEventoSeguro($idEvento);

            if ($evento->estado_id == 1) {
                throw new \Exception('El evento ya está publicado');
            }

            //Validaciones básicas antes de publicar
            $faltantes = [];

            if (!$evento->titulo) $faltantes[] = 'Título';
            if (!$evento->descripcion) $faltantes[] = 'Descripción';
            if (!$evento->fecha_evento) $faltantes[] = 'Fecha del evento';
            if (!$evento->hora_evento) $faltantes[] = 'Hora del evento';
            if (!$evento->id_modalidad) $faltantes[] = 'Modalidad';
            if (!$evento->id_ubicacion) $faltantes[] = 'Ubicación';

            if (!empty($faltantes)) {
                throw new \DomainException(
                    'No se puede publicar el evento. Faltan: ' . implode(', ', $faltantes)
                );
            }

            $this->eventoRepository->publicarEvento($idEvento);

            $eventoPublicado = $this->eventoRepository->obtenerEventoCompleto($idEvento);
            $destinatarios = $this->obtenerDestinatariosEvento($idEvento);

            if ($destinatarios->count() > 0) {
                foreach ($destinatarios as $destinatario) {
                    Mail::to($destinatario->correo)->queue(new EventoPublicadoMail($eventoPublicado));
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Inactivar evento
     */
    public function inactivarEvento(int $idEvento, string $motivo)
    {
        DB::beginTransaction();

        try {
            $evento = $this->obtenerEventoSeguro($idEvento);

            if ($evento->estado_id == 2) {
                throw new \Exception('El evento ya está inactivo');
            }

            $usuario = Auth::user();

            // Guardar datos antes de cambiar estado
            $eventoData = [
                'titulo' => $evento->titulo,
            ];

            $inscritos = $this->eventoRepository->obtenerInscritosEvento($idEvento);

            // INACTIVAR
            $this->eventoRepository->inactivarEvento($idEvento);

            // BITÁCORA
            DB::table('bitacora_cambios')->insert([
                'tabla_afectada' => 'eventos',
                'operacion' => 'INACTIVAR',
                'usuario_responsable' => $usuario->id_usuario,
                'fecha_cambio' => now(),
                'descripcion_cambio' => 'Evento ID ' . $idEvento . ' inactivado. Motivo: ' . $motivo,
            ]);

            // ENVIAR CORREOS
            foreach ($inscritos as $usuarioInscrito) {
                Mail::to($usuarioInscrito->correo)->queue(
                    new EventoCanceladoMail($eventoData, $motivo)
                );
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Obtener modalidades (para filtros frontend)
     */
    public function obtenerModalidades()
    {
        return $this->eventoRepository->obtenerModalidades();
    }

    /**
     * Obtener ubicaciones
     */
    public function obtenerUbicaciones()
    {
        return $this->eventoRepository->obtenerUbicaciones();
    }

    /**
     * Obtener carreras para el formulario de eventos
     */
    public function obtenerCarreras()
    {
        return $this->eventoRepository->obtenerCarreras();
    }

    /**
     * Obtener roles para el formulario de eventos
     */
    public function obtenerRolesInteresados()
    {
        return $this->eventoRepository->obtenerRolesInteresados();
    }

    public function eliminarInscripcionEvento(int $idEvento, int $idUsuario): void
    {
        DB::beginTransaction();

        try {
            $evento = $this->obtenerEventoSeguro($idEvento);

            $eliminado = $this->eventoRepository->eliminarInscripcionEvento(
                $evento->id_evento,
                $idUsuario
            );

            if (!$eliminado) {
                throw new \Exception('La inscripción no existe.');
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Generar PDF de participantes o asistencia del evento
     */
    public function generarPdfEvento(int $idEvento, string $tipo)
    {
        $evento = $this->obtenerEventoCompleto($idEvento);

        if (!$evento) {
            throw new \Exception('Evento no encontrado.');
        }

        $inscritos = $this->obtenerInscritosEventoGestion($idEvento);

        if ($tipo === 'participantes') {
            $pdf = Pdf::loadView('pdf.evento-inscritos', [
                'evento' => $evento,
                'inscritos' => $inscritos,
            ]);

            return $pdf->download('Participantes_' . $evento->titulo . '.pdf');
        }

        if ($tipo === 'asistencia') {
            $pdf = Pdf::loadView('pdf.evento-asistencia', [
                'evento' => $evento,
                'inscritos' => $inscritos,
            ]);

            return $pdf->download('Asistencia_' . $evento->titulo . '.pdf');
        }

        throw new \Exception('Tipo de PDF inválido.');
    }

    /**
     * Enviar recordatorio a inscritos del evento
     */
    public function enviarRecordatorio(array $correos, array $datos): void
    {
        foreach ($correos as $correo) {
            Mail::to($correo)->send(new RecordatorioEventoMail($datos));
        }
    }
}
