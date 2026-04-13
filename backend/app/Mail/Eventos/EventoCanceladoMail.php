<?php

namespace App\Mail\Eventos;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class EventoCanceladoMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public array $evento;
    public ?string $motivo;

    public function __construct(array $evento, ?string $motivo = null)
    {
        $this->evento = $evento;
        $this->motivo = $motivo;
    }

    public function build()
    {
        return $this->subject('Cancelación de evento – GradEm SIUA')
            ->view('emails.eventos.evento_cancelado')
            ->with([
                'evento' => $this->evento,
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