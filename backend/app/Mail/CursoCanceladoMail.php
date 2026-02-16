<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CursoCanceladoMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $curso;
    public ?string $motivo;

    public function __construct(array $curso, ?string $motivo = null)
    {
        $this->curso = $curso;
        $this->motivo = $motivo;
    }

    public function build()
    {
        return $this->subject('Cancelación de curso – GradEm SIUA')
            ->view('emails.cursos.curso_cancelado')
            ->with([
                'curso' => $this->curso,
                'motivo' => $this->motivo,
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
