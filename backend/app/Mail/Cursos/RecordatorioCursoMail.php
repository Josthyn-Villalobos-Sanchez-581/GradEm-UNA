<?php

namespace App\Mail\Cursos;

use Illuminate\Mail\Mailable;

class RecordatorioCursoMail extends Mailable
{
    public array $datos;

    public function __construct(array $datos)
    {
        $this->datos = $datos;
    }

    public function build()
    {
        return $this
            ->subject('Recordatorio de curso – ' . ($this->datos['nombre_curso'] ?? 'GradEm SIUA'))
            ->view('emails.cursos.recordatorio')
            ->with($this->datos)
            ->withSymfonyMessage(function ($message) {
                $message->embedFromPath(
                    public_path('logos/logo_universidad.png'),
                    'logo_universidad'
                );
                $message->embedFromPath(
                    public_path('logos/logo_gradem.png'),
                    'logo_gradem'
                );
            });
    }
}