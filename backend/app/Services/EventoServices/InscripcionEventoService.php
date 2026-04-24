<?php

namespace App\Services\EventoServices;
// backend/app/Services/EventoServices/InscripcionEventoService.php 
use App\Repositories\EventoRepository\EventoRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\Eventos\InscripcionConfirmadaEventoMail;
use App\Mail\Eventos\CancelacionUsuarioEventoMail;
use Exception;

class InscripcionEventoService
{
    protected EventoRepository $repository;

    public function __construct(EventoRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     *  Inscribirse a un evento
     */
public function inscribirse(int $idEvento)
{
    DB::beginTransaction();

    try {
        $usuario = Auth::user();

        if (!$usuario) {
            throw new Exception('Usuario no autenticado');
        }

        $evento = $this->repository->obtenerEventoPorId($idEvento);

        if (!$evento) {
            throw new Exception('Evento no existe');
        }

        if ($evento->estado_id != 1) {
            throw new Exception('El evento no está disponible para inscripción');
        }

        if ($evento->fecha_evento < Carbon::now()->toDateString()) {
            throw new Exception('El evento ya pasó');
        }

        if ($this->repository->existeInscripcionActiva($idEvento, $usuario->id_usuario)) {
            throw new Exception('Ya estás inscrito en este evento');
        }

        if (!is_null($evento->cupos) && $evento->cupos > 0) {
            $inscritos = $this->repository->contarInscritos($idEvento);

            if ($inscritos >= $evento->cupos) {
                throw new Exception('El evento ya alcanzó su capacidad máxima');
            }
        }

        $this->repository->crearInscripcion([
            'id_evento' => $idEvento,
            'id_usuario' => $usuario->id_usuario,
            'fecha_inscripcion' => now(),
            'estado_id' => 1
        ]);


        $eventoActualizado = $this->repository->obtenerEventoParaInscripcionPorId($idEvento);

        DB::commit();
// Enviar correo de confirmación
try {
    $eventoCompleto = $this->repository->obtenerEventoCompleto($idEvento);
    Mail::to($usuario->correo)->send(
        new InscripcionConfirmadaEventoMail($eventoCompleto, $usuario->nombre_completo)
    );
} catch (\Exception $e) {
    // No interrumpir el flujo si el correo falla
    \Log::warning('No se pudo enviar correo de inscripción evento: ' . $e->getMessage());
}
        return $eventoActualizado;

    } catch (Exception $e) {
        DB::rollBack();
        throw $e;
    }
}

    /**
     *  Cancelar inscripción
     */
    public function cancelar(int $idEvento): void
    {
        DB::beginTransaction();

        try {
            $usuario = Auth::user();

            if (!$usuario) {
                throw new Exception('Usuario no autenticado');
            }

            $inscripcion = $this->repository->obtenerInscripcion($idEvento, $usuario->id_usuario);

            if (!$inscripcion) {
                throw new Exception('No estás inscrito en este evento');
            }

            //  CAMBIAR ESTADO A CANCELADO
            $this->repository->actualizarEstadoInscripcion(
                $idEvento,
                $usuario->id_usuario,
                2 // cancelado
            );

            DB::commit();
// Enviar correo de cancelación
DB::commit();

try {
    $eventoCompleto = $this->repository->obtenerEventoCompleto($idEvento);
    Mail::to($usuario->correo)->send(
        new CancelacionUsuarioEventoMail(
            (array) $eventoCompleto,
            $usuario->nombre_completo
        )
    );
} catch (\Exception $e) {
    \Log::warning('No se pudo enviar correo de cancelación: ' . $e->getMessage());
}
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     *  Obtener mis inscripciones
     */
    public function obtenerMisInscripciones(int $idUsuario): array
    {
        return $this->repository->obtenerEventosUsuario($idUsuario);
    }

    /**
     *  Obtener cantidad de inscritos por evento
     */
    public function obtenerInscritosCount(): array
    {
        return $this->repository->obtenerConteoInscritos();
    }
public function obtenerModalidades(): array
{
    return $this->repository->obtenerModalidades()->toArray();
}
public function obtenerEventoCompleto(int $idEvento): object
{
    $evento = $this->repository->obtenerEventoCompleto($idEvento);

    if (!$evento) {
        throw new \Exception('Evento no encontrado');
    }

    return $evento;
}
public function obtenerEventosParaInscripcion(int $idCarrera, int $idRol): array
{
    return $this->repository->obtenerEventosActivosParaInscripcion($idCarrera, $idRol);
}

public function obtenerEventoParaInscripcionPorId(int $idEvento)
{
    return $this->repository->obtenerEventoParaInscripcionPorId($idEvento);
}
public function obtenerMisEventos(int $idUsuario): array
{
    return $this->repository->obtenerMisEventos($idUsuario);
}
}