<?php

namespace App\Services\EventoServices;

use App\Repositories\EventoRepository\EventoRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Mail\Eventos\EventoCanceladoMail;
use App\Mail\Eventos\RecordatorioEventoMail;
use App\Mail\Eventos\DesinscripcionEventoMail;
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
     * Eliminar inscripción de un usuario en evento
     */
    public function eliminarInscripcionEvento(int $idEvento, int $idUsuario): void
    {
        DB::beginTransaction();

        try {
            $evento = $this->obtenerEventoSeguro($idEvento);
            $inscrito = $this->eventoRepository->obtenerInscritoEvento(
                $evento->id_evento,
                $idUsuario
            );

            if (!$inscrito) {
                throw new \Exception('La inscripción no existe.');
            }

            $eliminado = $this->eventoRepository->eliminarInscripcionEvento(
                $evento->id_evento,
                $idUsuario
            );

            if (!$eliminado) {
                throw new \Exception('La inscripción no existe.');
            }

            if (!empty($inscrito->correo)) {
                Mail::to($inscrito->correo)->queue(new DesinscripcionEventoMail(
                    [
                        'titulo' => $evento->titulo,
                        'fecha_evento' => $evento->fecha_evento,
                        'hora_evento' => $evento->hora_evento,
                    ],
                    $inscrito->nombre_completo
                ));
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
    public function enviarRecordatorio(int $idEvento, array $datos): int
    {
        $evento = $this->obtenerEventoSeguro($idEvento);
        $inscritos = $this->eventoRepository->obtenerInscritosGestionEvento($evento->id_evento);
        $enviados = 0;

        foreach ($inscritos as $inscrito) {
            if (empty($inscrito->correo)) {
                continue;
            }

            Mail::to($inscrito->correo)->queue(new RecordatorioEventoMail([
                ...$datos,
                'nombre_participante' => $inscrito->nombre_completo,
            ]));
            $enviados++;
        }

        return $enviados;
    }
}
