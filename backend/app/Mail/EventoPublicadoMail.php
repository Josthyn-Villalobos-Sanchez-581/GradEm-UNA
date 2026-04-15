<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventoPublicadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $evento;

    public function __construct($evento)
    {
        $this->evento = $evento;
    }

    public function build()
    {
        return $this->subject('Nuevo evento publicado – GradEm SIUA')
            ->view('emails.eventos.evento_publicado')
            ->with([
                'evento' => $this->evento,
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
