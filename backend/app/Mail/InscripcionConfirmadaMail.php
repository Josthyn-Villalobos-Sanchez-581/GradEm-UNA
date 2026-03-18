<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Curso;

class InscripcionConfirmadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public Curso $curso;
    public string $nombreParticipante;

    public function __construct(Curso $curso, string $nombreParticipante)
    {
        $this->curso = $curso;
        $this->nombreParticipante = $nombreParticipante;
    }

    public function build()
    {
        return $this->subject('Inscripción confirmada – ' . $this->curso->titulo . ' – GradEm SIUA')
            ->view('emails.cursos.inscripcion_confirmada')
            ->with([
                'curso'              => $this->curso,
                'nombreParticipante' => $this->nombreParticipante,
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
