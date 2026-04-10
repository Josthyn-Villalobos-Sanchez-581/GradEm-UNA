<?php

namespace App\Services\EventoServices;

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
            $evento->id_usuario_creador !== $usuario->id_usuario
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

            $inscritos = $this->eventoRepository->obtenerInscritosEvento($idEvento);

            if ($inscritos->isEmpty()) {
                DB::commit();
                return;
            }


            foreach ($inscritos as $usuarioInscrito) {
                dispatch(function () use ($usuarioInscrito, $motivo) {
                    Mail::raw(
                        "El evento ha sido cancelado.\n\nMotivo: " . $motivo,
                        function ($message) use ($usuarioInscrito) {
                            $message->to($usuarioInscrito->correo)
                                ->subject('Evento cancelado');
                        }
                    );
                });
            }

            // 📧 (Opcional - vos lo manejás)
            // $inscritos = $this->eventoRepository->obtenerInscritosEvento($idEvento);

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
}
