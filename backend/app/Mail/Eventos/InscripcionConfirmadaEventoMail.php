<?php
// app/Mail/Eventos/InscripcionConfirmadaEventoMail.php

namespace App\Mail\Eventos;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InscripcionConfirmadaEventoMail extends Mailable
{
    use Queueable, SerializesModels;

    public object $evento;
    public string $nombreParticipante;

    public function __construct(object $evento, string $nombreParticipante)
    {
        $this->evento = $evento;
        $this->nombreParticipante = $nombreParticipante;
    }

    public function build()
    {
        return $this->subject('Inscripción confirmada – ' . $this->evento->titulo . ' – GradEm SIUA')
            ->view('emails.eventos.inscripcion_confirmada_evento')
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