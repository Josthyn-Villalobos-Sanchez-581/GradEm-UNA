<?php

namespace App\Services\NotificacionCursoServices;

use App\Repositories\MailRepositories\MailRepository;
use App\Repositories\NotificacionCursoRepositories\NotificacionCursoRepository;
use App\Mail\Cursos\CorreoMasivoCursoMail;
use App\Mail\Cursos\RecordatorioCursoMail;
use App\Mail\Cursos\CambioInscripcionCursoMail;
use Illuminate\Support\Facades\Log;

class NotificacionCursoService
{
    protected MailRepository $mailRepository;
    protected NotificacionCursoRepository $notificacionCursoRepository;

    public function __construct(
        MailRepository $mailRepository,
        NotificacionCursoRepository $notificacionCursoRepository
    ) {
        $this->mailRepository = $mailRepository;
        $this->notificacionCursoRepository = $notificacionCursoRepository;
    }

    public function enviarCorreoMasivo(array $correos, array $datos)
    {
        try {
            foreach ($correos as $correo) {
                $this->mailRepository->enviarCorreo(
                    $correo,
                    new CorreoMasivoCursoMail($datos)
                );
            }
        } catch (\Exception $e) {
            Log::error('Error correo masivo cursos', ['error' => $e->getMessage()]);
            throw new \Exception(
                'Ocurrió un error, los correos no fueron enviados, vuelva a intentarlo'
            );
        }
    }

    public function enviarRecordatorio(array $correos, array $datos)
    {
        try {
            foreach ($correos as $correo) {
                $this->mailRepository->enviarCorreo(
                    $correo,
                    new RecordatorioCursoMail($datos)
                );
            }
        } catch (\Exception $e) {
            Log::error('Error recordatorio cursos', ['error' => $e->getMessage()]);
            throw new \Exception(
                'Ocurrió un error, los correos no fueron enviados, vuelva a intentarlo'
            );
        }
    }

    public function notificarCambioInscripcion(array $correos, array $datos)
    {
        foreach ($correos as $correo) {
            $this->mailRepository->enviarCorreo(
                $correo,
                new CambioInscripcionCursoMail($datos)
            );
        }

        // Notificación interna (futuro: tabla o sistema interno)
        $this->notificacionCursoRepository->registrarEvento($datos);
    }
}
