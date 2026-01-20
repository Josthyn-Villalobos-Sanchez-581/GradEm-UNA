<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CodigoVerificacionMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $codigo;

    public function __construct(string $codigo)
    {
        $this->codigo = $codigo;
    }

    public function build()
    {
        return $this->subject('Código de verificación – GradEm SIUA')
            ->view('emails.codigo_verificacion')
            ->with([
                'codigo' => $this->codigo,
            ])
            ->withSymfonyMessage(function ($message) {
                $message->embedFromPath(public_path('logos/logo_universidad.png'), 'logo_universidad');
                $message->embedFromPath(public_path('logos/logo_gradem.png'), 'logo_gradem');
            });
    }
}
