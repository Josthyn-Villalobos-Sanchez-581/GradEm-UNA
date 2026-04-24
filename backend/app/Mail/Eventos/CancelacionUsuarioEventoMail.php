<?php
// app/Mail/Eventos/CancelacionUsuarioEventoMail.php

namespace App\Mail\Eventos;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CancelacionUsuarioEventoMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $evento;
    public string $nombreParticipante;

    public function __construct(array $evento, string $nombreParticipante)
    {
        $this->evento = $evento;
        $this->nombreParticipante = $nombreParticipante;
    }

    public function build()
    {
        return $this->subject('Cancelación de inscripción – ' . ($this->evento['titulo'] ?? 'Evento') . ' – GradEm SIUA')
            ->view('emails.eventos.cancelacion_usuario_evento')
            ->with([
                'evento'             => $this->evento,
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