<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Curso;

class CursoActualizadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public Curso $curso;
    public array $cambios;

    public function __construct(Curso $curso, array $cambios)
    {
        $this->curso = $curso;
        $this->cambios = $cambios;
    }

    public function build()
    {
        return $this->subject('Actualización importante de curso – GradEm SIUA')
            ->view('emails.cursos.curso_actualizado')
            ->with([
                'curso' => $this->curso,
                'cambios' => $this->cambios,
            ])
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
