<?php

namespace App\Mail\Eventos;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DesinscripcionEventoMail extends Mailable implements ShouldQueue
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
        return $this->subject('Has sido desinscrito del evento – ' . ($this->evento['titulo'] ?? 'GradEm SIUA') . ' – GradEm SIUA')
            ->view('emails.eventos.desinscripcion_evento')
            ->with([
                'evento' => $this->evento,
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
