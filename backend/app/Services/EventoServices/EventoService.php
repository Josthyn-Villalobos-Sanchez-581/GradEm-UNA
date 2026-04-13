<?php

namespace App\Services\EventoServices;

use App\Mail\EventoActualizadoMail;
use App\Mail\EventoPublicadoMail;
use App\Repositories\EventoRepository\EventoRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class EventoService
{
    protected $eventoRepository;

    public function __construct(EventoRepository $eventoRepository)
    {
        $this->eventoRepository = $eventoRepository;
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

        // 🔒 VALIDACIÓN DE ACCESO
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
                'estado_id' => 2,
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

            $carrerasOriginales = array_map('strval', $eventoCompleto->carreras_invitadas ?? []);
            sort($carrerasOriginales);

            $rolesOriginales = array_map('strval', $eventoCompleto->roles_interesados ?? []);
            sort($rolesOriginales);

            $carrerasActuales = array_map('strval', $request->carreras_invitadas ?? []);
            sort($carrerasActuales);

            $rolesActuales = array_map('strval', $request->roles_interesados ?? []);
            sort($rolesActuales);

            if ($carrerasOriginales !== $carrerasActuales || $rolesOriginales !== $rolesActuales) {
                $cambiosCriticos['destinatarios'] = 'Se actualizó la selección de carreras o roles interesados';
            }

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
                    Mail::to($destinatario->correo)->send(
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

            // 🔒 Validaciones básicas antes de publicar
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
                    Mail::to($destinatario->correo)->send(new EventoPublicadoMail($eventoPublicado));
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Inactivar evento (HU-33 PARTE 2 🔥)
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

            // ✅ INACTIVAR
            $this->eventoRepository->inactivarEvento($idEvento);

            // 🧾 BITÁCORA
            DB::table('bitacora_cambios')->insert([
                'tabla' => 'eventos',
                'accion' => 'INACTIVAR',
                'id_registro' => $idEvento,
                'descripcion' => $motivo,
                'usuario_id' => $usuario->id_usuario,
                'fecha' => now(),
            ]);

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
}
