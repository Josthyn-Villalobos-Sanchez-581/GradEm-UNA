<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventoActualizadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $evento;
    public array $cambios;

    public function __construct($evento, array $cambios)
    {
        $this->evento = $evento;
        $this->cambios = $cambios;
    }

    public function build()
    {
        return $this->subject('Actualización importante de evento – GradEm SIUA')
            ->view('emails.eventos.evento_actualizado')
            ->with([
                'evento' => $this->evento,
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
